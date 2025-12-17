# Betriebsmodell und Release-Strategie

## Branch- und Release-Strategie
- **main**: stets deploy-fähiger Code für **Production**. Release-Tags (`vX.Y.Z`) werden hiervon erstellt und automatisch auf die Produktivumgebung ausgerollt.
- **develop**: Integrationsbranch für **Staging**. Jeder Merge triggert einen Staging-Build/Deployment-Job.
- **Feature-Branches**: `feature/<ticket-oder-kurzbeschreibung>` gehen per Pull Request nach `develop`.
- **Hotfix-Branches**: `hotfix/<ticket-oder-bug>` basieren auf `main`, werden nach dem Fix sowohl in `main` als auch zurück in `develop` gemergt.
- **Release-Kandidaten**: Optionale `release/<version>`-Branches, falls mehrere Stabilisierungsschritte nötig sind; werden nach Abschluss in `main` und `develop` gemergt und mit `vX.Y.Z` getaggt.

## Backend-Deploy-Targets
| Umgebung | API-URL | Deployment-Branch | DB | Auth | Storage |
| --- | --- | --- | --- | --- | --- |
| **Staging** | `https://api-staging.wimmelwelt.de` | `develop` | `MONGODB_URI` auf `mongodb+srv://staging-cluster` (DB: `wimmelwelt_staging`) | JWT-Secret via `AUTH_SECRET` aus Secrets-Manager | S3-Bucket `wimmelwelt-staging` (`AWS_REGION=eu-central-1`) |
| **Production** | `https://api.wimmelwelt.de` | `main` | `MONGODB_URI` auf `mongodb+srv://prod-cluster` (DB: `wimmelwelt_prod`) | JWT-Secret via `AUTH_SECRET` aus Secrets-Manager | S3-Bucket `wimmelwelt-prod` (`AWS_REGION=eu-central-1`) |

**Allgemeine Variablen**
- `PORT`: API-Port (Staging: `5000`, Prod: `5000` oder Load-Balancer-Port).
- `FILE_STORAGE_MODE`: Standard `s3`; auf Staging kann `local` genutzt werden, falls kein S3 nötig ist.
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: jeweils als Deployment-Secret hinterlegen; niemals im Repo.
- Optional können granulare Mongo-Einstellungen (`MONGODB_HOST`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`, `MONGODB_DB_NAME`, `MONGODB_OPTIONS`) genutzt werden, falls kein kompletter URI bereitgestellt wird.

## Monitoring & Logging
- **APM/Tracing**: OpenTelemetry-Collector erreichbar unter `https://otel.wimmelwelt.de`. Services exportieren OTLP über `OTEL_EXPORTER_OTLP_ENDPOINT`; für Staging/Prod getrennte API-Tokens im CI/CD hinterlegen.
- **Metriken/Dashboards**: Grafana unter `https://grafana.wimmelwelt.de` mit Dashboards `Backend / API` (HTTP-Latenz, Fehlerquoten) und `MongoDB` (Operationen, Connections). Teamzugang via SSO (Azure AD Gruppe „Wimmelwelt Backend“).
- **Logs**: Central Logging bei `https://logs.wimmelwelt.de` (ELK/Opensearch). Applikationslogs werden per JSON an `LOG_ENDPOINT` geschickt; Default-Index: `backend-staging-*` bzw. `backend-prod-*`. Access über SSO, Kibana-Role „ww-backend-dev“.
- **Alerts**: PagerDuty-Service „Wimmelwelt Backend“. Routing: Staging-Warnungen nur per E-Mail, Prod-Alerts per On-Call-Rotation. Alert-Regeln sind in Grafana Alerting hinterlegt; Ownership im Team-Runbook (Confluence) dokumentiert.
- **Health Checks**: `/api/health` liefert DB-/Storage-Status. Ingress und Uptime-Monitor überwachen den Endpoint alle 60s (Prod) bzw. 5m (Staging).
