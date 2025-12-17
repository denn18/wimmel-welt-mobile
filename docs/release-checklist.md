# Release-Checklist & Betriebsleitfaden

> Operative Details (RACI, Go-Live-, Rollback- und Alert-Abläufe) stehen im [Betriebs-Runbook](operational-runbook.md). Diese Checkliste referenziert die dortigen Gates und macht sie für Staging/Prod messbar.

## 1. Release-Checklist (Staging & Prod)

- **Smoke-Tests (App/UI)**
  - App-Start (Splash → Home) ohne Fehler.
  - Login & Registrierung (E-Mail/Passwort) inkl. Validierung und Reset-Flows.
  - Rollenwechsel Eltern ↔ Betreuungsperson per Account oder Feature-Toggle.
  - Push/Notifications (falls Backend-Konfiguration vorhanden): Opt-in/Token-Registrierung, Empfang einer Test-Nachricht, Verhalten im Hintergrund/Vordergrund.

- **Haupt-API-Flows**
  - Auth: `/api/auth/login`, `/api/auth/register` (happy path + ungültige Credentials → 401).
  - Profile: Eltern/Betreuungsperson lesen/aktualisieren (`/api/parents`, `/api/caregivers`).
  - Matching: Anfrage anlegen, Liste laden, Match akzeptieren/ablehnen (`/api/matches`).
  - Messaging: Nachrichten senden/lesen, Anhänge hochladen (`/api/messages`, `/api/files`).
  - Dokumente: Hoch-/Runterladen (`/api/documents`, `/api/files`).
  - Health/Readiness: `/health` (Prozess), `/readiness` (DB-Ping) müssen **200** bzw. **503** bei Ausfall liefern.

- **Regression/Querschnitt**
  - Rate-Limits/API-Fehler werden sauber als JSON gemeldet.
  - Logging-Level passend zur Umgebung (Staging: `debug`, Prod: `info`, überschreibbar via `LOG_LEVEL`).
  - Feature-Flags/Environment-Vars final (MONGO_DB_URL, FILE_STORAGE_MODE, Push-Keys etc.).

- **Freigabe-Check**
  - Changelog und Tickets reviewed.
  - Monitoring/Alerts grün (siehe unten).
  - Rollback-Plan verlinkt.
  - Pflicht-Secrets/Env-Vars für Zielumgebung hinterlegt (Prod: `MONGODB_URI`, `AUTH_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `FILE_STORAGE_MODE=s3`, `AWS_REGION`, `LOG_ENDPOINT`, `OTEL_EXPORTER_OTLP_ENDPOINT` + Prod-Token; Staging: Gegenstücke mit Staging-Token und ggf. `FILE_STORAGE_MODE=local`). CI/CD-Gate schlägt fehl, wenn eine Variable leer ist.
  - Kommunikationsplan bestätigt (Slack-Kanal, Statuspage-Template, On-Call aktiviert).

**Staging-Gate-Protokoll (T-12h)**
- Deployment `develop` → Staging durchgeführt, Artefakt-Version/Commit notiert.
- Smoke-Tests (App + API) dokumentiert, Screenshots/Logs abgelegt.
- Health-Checks `/health` + `/readiness` = **200**; Logs fließen in `backend-staging-*`; OTEL-Events mit Staging-Token sichtbar.
- Bekannte offene P1/P2 in Staging adressiert oder explizit akzeptiert.

**Go-Live-Entscheid (T-1h)**
- Product Owner + Release Captain bestätigen Go/No-Go.
- Backups <24h alt, Restore-Test <30 Tage; Down-Migration vorhanden.
- On-Call/PagerDuty aktiv; Eskalationskette klar (siehe Runbook).

## 2. Observability, Monitoring & Alerting

- **APM**: Application-Performance-Monitoring (z. B. Datadog/New Relic) mit Dashboards für
  - Request-Throughput, Latenz (p50/p95/p99), Fehlerquote 4xx/5xx, DB-Latenzen.
  - Event „Release“ Tag, um Staging/Prod-Vergleich zu ermöglichen.

- **Logging**
  - Zentraler Log-Forwarder (z. B. Loki/ELK) ingestet `logger.level` (error/warn/info/debug).
  - Saved searches: „Auth 401/429“, „MongoDB Ping Fehler“, „Push-Zustellung fehlgeschlagen“.

- **Dashboards**
  - **API Health**: Uptime `/health` + `/readiness`, Fehlerquote pro Route.
  - **Auth & Messaging**: Login-Rate, Registrierungen, gesendete/zugestellte Nachrichten.
  - **Storage**: Upload-Fehlerquote, S3/Local Storage Latenzen.

- **Alerts** (Schwellenwerte exemplarisch)
  - Readiness-Check 5 Minuten lang >0,5% 503 → P1 Pager.
  - Fehlerquote 5xx >2% über 5 Minuten oder DB-Latenz p95 > 500 ms → P1.
  - Push-Fehlerrate >5% 10 Minuten → P2.
  - Logging-Stille (keine `info`-Events 10 Minuten) → P2, um abgestürzte Prozesse zu erkennen.
  - Status-Page (z. B. Statuspage.io) mit Komponenten: API, Push, Datenbank, Storage.

## 3. Staging Test-Release (Protokoll)

- **CI/CD**: Pipeline über Repository-Workflow/CI-UI triggern (Branch `main` → Staging). Artefakt-Version und Commit-Hash dokumentieren.
- **Deployment-Validierung**
  - Endpunkte `/health` und `/readiness` abfragen und in Runbook eintragen.
  - Smoke-Tests gemäß Abschnitt 1 durchführen (manuell oder automatisiert via Detox/Postman). Ergebnisse inkl. Screenshots/Logs im Staging-Run anfügen.
  - Logging-Level prüfen (`LOG_LEVEL` in Staging auf `debug`) und stichprobenartig Logs sichten.
- **Aktueller Stand dieses Durchlaufs**: Ausführung in dieser Offline-Umgebung nicht möglich. Bei echtem Staging-Run bitte die oben genannten Ergebnisse (Status, Links, Zeitstempel) ergänzen.

## 4. Go-Live-Plan & Rollback

- **Fenster**: Deployment außerhalb der Hauptnutzung (z. B. 20–22 Uhr CET). Einplanung in Kalender + On-Call-Bereitschaft.
- **Strategie**: Blue/Green bevorzugt, fallback Canary 10%→50%→100% Traffic.
- **Ablauf**
  1. Pre-Checks: Monitoring grün, Readiness aller Pods grün, Backups aktuell.
  2. Deploy neue Version in „Green“ Umgebung, führen Smoke-Tests aus.
  3. Schalte Traffic per Load-Balancer/Ingress auf Green (Canary-Stufen falls nötig).
  4. Nach 30 Min Stabilität ggf. auf 100% erhöhen und Green als neue Prod markieren.
- **Rollback**
  - Sofort Traffic zurück auf „Blue“ drehen (oder Canary auf 0%).
  - Falls DB-Migration: Down-Migration/Backup-Restore vorbereiten und verlinken.
  - Incident-Kommunikation: Status-Page-Update + Team-Alarme.

- **Dokumentation**: Nach jedem Release Dashboard-Screenshots/Alert-Logs im Release-Ordner ablegen und in diesem Dokument verlinken.
