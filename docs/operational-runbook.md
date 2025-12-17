# Betriebs-Runbook: Go-Live, Change Management & Incident-Handling

Dieses Runbook übersetzt die Branch-/Deploy-Strategie und Monitoring-Setups aus dem Operating Model in geübte Abläufe. Es deckt Staging und Production ab und ergänzt verbindliche Rollen, Gates und Kommunikationswege.

## 1. Rollen & RACI
| Aktivität | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Go/No-Go-Entscheid | Release Captain (Backend) | Product Owner | On-Call (SRE/Backend), QA | Stakeholder, Support |
| Deployment auslösen (CI/CD) | Release Captain | Product Owner | On-Call | Stakeholder |
| Rollback auslösen | On-Call | Product Owner | Release Captain | Stakeholder |
| Incident-Kommunikation | On-Call | Product Owner | Release Captain | Support |
| Runbook-/Alert-Updates | Release Captain | Product Owner | On-Call, Observability Owner | Team |

**Rollen-Kurzbeschreibung**
- **Release Captain**: plant Release-Fenster, prüft Gates, triggert Deploy/Rollback.
- **On-Call**: überwacht Alerts, entscheidet bei SLA/SLO-Verstößen, koordiniert Incident-Response.
- **Observability Owner**: pflegt Dashboards/Alert-Regeln und prüft Token/Endpoints.
- **Product Owner**: gibt Releases frei, priorisiert Backlog, autorisiert Rollbacks mit Product-Impact.

## 2. Release- & Go-Live-Playbook
### 2.1 Preflight (T-24h)
- Release-Kandidaten/Tickets abgeschlossen; Changelog aktualisiert.
- CI-Grün, Artefakt-Version + Commit-Hash dokumentiert.
- DB-Migrationsplan + Down-Migration/Backup-Plan verlinkt.
- Secrets/Env-Vars nach Zielumgebung geprüft (siehe Abschnitt 6).
- Kommunikationsplan bestätigt (Slack-Kanal, Statuspage-Template vorbereitet).

### 2.2 Staging-Gate (T-12h)
- Branch `develop` → Staging deployen.
- Smoke-Tests aus [`docs/release-checklist.md`](release-checklist.md#1-release-checklist-staging--prod) durchführen; Ergebnisse mit Timestamp und Tester notieren.
- Health-Checks dokumentieren: `/health`, `/readiness` müssen **200** liefern (Readiness bei absichtlich blockierter DB: **503**).
- Observability prüfen: Logs fließen in `backend-staging-*`, OTEL-Export aktiv mit Staging-Token, Grafana-Dashboards laden.

### 2.3 Go-Live-Entscheid (T-1h)
- Product Owner + Release Captain bestätigen Go/No-Go.
- On-Call ist aktiv und erreichbar; PagerDuty im „On-Call“-Modus.
- Backups aktuell (Timestamp <24h) und Restore-Testdatum <30 Tage.

### 2.4 Production-Deployment (Blue/Green, fallback Canary)
1. **Pre-Checks**: API-Readiness grün, Alert-Console ohne aktive P1/P2.
2. **Deploy Green**: `main`-Artefakt auf Green-Umgebung ausrollen; Migrationen anwenden.
3. **Smoke-Tests** auf Green gemäß Checklist; Log- und APM-Events kontrollieren.
4. **Traffic-Umschwenk**: 10% → 50% → 100% (oder direkt 100% bei stabilem Blue/Green). Dauerhaftes Monitoring der Error-Rate.
5. **Post-Deploy-Monitoring**: 30–60 min beobachten (siehe Abschnitt 4).

## 3. Rollback-Playbook
- **Trigger**: Error-Rate 5xx >2% über 5 Min, p95-Latenz >500 ms über 5 Min, Readiness fluktuiert >0,5%, Push-Fehlerrate >5% über 10 Min, oder kritische App-Bugs.
- **Schritte**
  1. Traffic sofort auf „Blue“ zurückdrehen (oder Canary auf 0%).
  2. Vorheriges Artefakt erneut deployen (Version N-1).
  3. DB-Migration rückgängig (Down-Migration) oder Backup Restore gemäß Plan.
  4. Incident-Kommunikation: Statuspage-Update, Slack-Channel informieren, Post-Mortem-Owner benennen.
  5. Alerts/Dashboards prüfen, bis Metriken stabil sind; Follow-up-Tickets für Ursache erstellen.

## 4. Post-Deployment-Verifikation
- **Zeitrahmen**: 30–60 Minuten nach Go-Live.
- **Kernmetriken** (Prod-SLOs / Staging-Grenzen):
  - Request-Latenz p95 <300 ms Prod / <400 ms Staging.
  - Fehlerquote 5xx <1% Prod / <2% Staging.
  - Readiness-Fehler <0,1% Prod / <0,5% Staging.
  - Push-Zustellungserfolg >95% Prod / >90% Staging.
- **Dashboards**: Grafana „Backend / API“, „MongoDB“, „Push/Notifications“ prüfen.
- **Logs**: Saved Searches „Auth 401/429“, „MongoDB Ping Fehler“, „Push-Zustellung fehlgeschlagen“ sichten.
- **Ticketing**: Gefundene Issues als Bug/Incident verlinken; Release-Notiz mit finalem Status ergänzen.

## 5. Change- & Freigabeprozess
- **Release-Kalender**: Standardfenster Di/Do 20–22 Uhr CET. Änderungen außerhalb nur mit Product Owner + On-Call Zustimmung.
- **Change-Freeze**: Während Peak-Traffic-Zeiten (8–18 Uhr CET) keine Prod-Deploys ohne Incident-Freigabe.
- **Freigabe-Checkliste**
  - Staging-Gate erfüllt und dokumentiert.
  - Monitoring/Alerts grün, offene P1/P2-Incidents geschlossen oder akzeptiert.
  - Rollback-Pfad validiert (Down-Migration/Backup getestet <30 Tage).
  - Kommunikationsplan und Stakeholder-Liste bestätigt.

## 6. Environment-Vars, Secrets & CI/CD-Gates
- **Pflichtvariablen Prod**: `MONGODB_URI` (Prod-Cluster, DB `wimmelwelt_prod`), `AUTH_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `FILE_STORAGE_MODE=s3`, `AWS_REGION=eu-central-1`, `LOG_LEVEL=info`, `LOG_ENDPOINT`, `OTEL_EXPORTER_OTLP_ENDPOINT`, Prod-OTEL-Token.
- **Pflichtvariablen Staging**: `MONGODB_URI` (Staging-Cluster, DB `wimmelwelt_staging`), Staging-`AUTH_SECRET`, Staging-S3-Credentials oder `FILE_STORAGE_MODE=local`, `LOG_LEVEL=debug`, Staging-Log-Endpoint/OTEL-Token.
- **CI/CD-Gates**
  - Pipeline bricht ab, wenn Pflichtvariablen im Target-Environment fehlen oder leer sind.
  - Post-Deploy Smoke-Tests (Health, Auth, Messaging, Upload) müssen grün sein, sonst automatischer Rollback-Trigger.
  - Build annotiert „Release“ Event im APM, damit Dashboards Releases vergleichen können.

## 7. Observability & Alerting (Routing)
- **Staging**: Alerts → E-Mail an Team, Slack-Channel `#wimmelwelt-staging`. P1/P2 nur als Heads-Up, kein PagerDuty.
- **Production**: P1/P2 → PagerDuty On-Call + Slack `#wimmelwelt-prod`. P3 als E-Mail/Slack.
- **Alert-Regeln (Minimal-Set)**
  - Readiness-Fehlerquote >0,5% (5 Min) Staging / >0,1% Prod.
  - 5xx-Fehlerquote >2% Staging / >1% Prod (5 Min).
  - MongoDB p95-Latenz >500 ms Staging / >400 ms Prod.
  - Push-Fehlerrate >5% Staging / >3% Prod über 10 Min.
  - Logging-Stille: keine `info` Logs 10 Min (Prod) / 30 Min (Staging).

## 8. Notfall- & Wiederanlauf-Szenarien
- **Backups**: Täglich automatisiert; wöchentlich Restore-Test dokumentieren; Ergebnisse in Ticketing verlinken.
- **DB-Failover**: Quartalsweise Übung (Primary-Ausfall simulieren); Metriken und Recovery-Zeit dokumentieren.
- **Storage-Recovery**: Staging-Test mit S3-Read/Write-Blockade; Verifikation der Fallbacks (`FILE_STORAGE_MODE=local`).
- **Kommunikation**: Statuspage-Templates für „API-Störung“, „Push-Probleme“, „DB-Failover“ vorbereiten.

## 9. Artefakte & Dokumentation
- Release-Läufe (Staging/Prod) im CI-Job-Protokoll verlinken.
- Screenshots/Logs der Smoke-Tests und relevante Dashboard-Screenshots im Release-Ordner ablegen.
- Post-Mortems innerhalb von 3 Arbeitstagen erstellen und hier verlinken; Runbook-Änderungen sofort nach Lessons Learned einpflegen.
