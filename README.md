# wimmel-welt-mobile

Dieses Repo dient als mobile Version von Wimmel Welt. Das Backend wird direkt aus dem funktionierenden "kleine Welt"-Repo übernommen, ohne dort Änderungen vorzunehmen.

Für die fachliche Logik der mobilen Screens (Formulare, Suche, Chat, Rechtstexte) muss die bestehende Web-App als Quelle der Wahrheit dienen. Siehe die Paritäts-Checkliste unter [`docs/mobile-frontend-parity.md`](docs/mobile-frontend-parity.md).

## Backend aus "kleine Welt" übernehmen
Nutze das Skript, um das Backend lokal zu kopieren (shallow clone) und hier unter `backend/` abzulegen:

```bash
scripts/clone-kleine-welt-backend.sh <kleine-welt-repo-url> [<backend-path-in-source>] [<target-dir>]
```

- `<kleine-welt-repo-url>`: HTTPS/SSH-URL des Quell-Repos.
- `<backend-path-in-source>`: Optionaler Pfad im Quell-Repo, der den Backend-Code enthält (Standard: `backend`).
- `<target-dir>`: Optionaler Zielordner in diesem Repo (Standard: `backend`).

Das Skript erstellt einen temporären Clone, kopiert die Dateien ohne `.git` in das Zielverzeichnis und verändert das Quell-Repo nicht. Nach dem Kopieren kannst du das Backend hier committen.

## Tests und Linting
- **Backend:** Das Backend wird standardmäßig unter `backend/` erwartet. Falls nur der Snapshot genutzt wird, greifen die Make-Targets automatisch auf `docs/backend-snapshot/` zurück.
  - `make backend-install` installiert die Backend-Dependencies.
  - `make backend-test` führt die Node.js-Tests (`npm run test:unit`) aus.
  - `make backend-lint` lintet den Backend-Code.
  - Setze für Integrationstests eine separate Test-Datenbank über `MONGO_DB_URL`/`MONGODB_URI` und optional `MONGO_DB_NAME` (z.B. `mongodb://localhost:27017/wimmelwelt_test`).
  - Optional kannst du mit `npm run test:db --prefix docs/backend-snapshot` die Verbindung zur Test-DB pingen.
- **App:** `make app-lint` oder `npm run lint --prefix app` prüft die mobile App.

## Betrieb & Deployment
Details zu Branch-/Release-Strategie, Deploy-Targets und Monitoring/Logging-Zugängen stehen in [`docs/operating-model.md`](docs/operating-model.md). Der operative Go-Live-, Rollback- und Alert-Ablauf ist im [Betriebs-Runbook](docs/operational-runbook.md) beschrieben.
