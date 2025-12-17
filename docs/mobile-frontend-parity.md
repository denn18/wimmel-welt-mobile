# Mobile-Frontend-Parity zur Web-App "kleine Welt"

Diese Checkliste stellt sicher, dass die mobile App die fachliche Logik der bestehenden Web-Anwendung übernimmt und die im Mockup gezeigten UX-Flows abdeckt.

## Quelle der Wahrheit
- **Logik & APIs** stammen aus dem Frontend-Repo von **"kleine Welt"**. Übernimm Validierungen, Fehlertexte und Request-Payloads unverändert, damit Backward-Compatibility gegeben ist.
- Prüfe für jede Logik-Übernahme, ob Feature Flags oder Berechtigungen im Web-Frontend gesetzt werden und spiegle diese in der Mobile-App.

## Screen- und Feature-Parität
- **Onboarding/Authentifizierung**: Login & Registrierung müssen dieselben Eingabe-Validierungen und Fehlermeldungen verwenden wie die Web-App; Token-Handling/Session-Renewal übernehmen.
- **Profil & Stammdaten**: Felder wie Name, Kontaktdaten, Öffnungszeiten, Betreuungsplätze, Zusatzinfos. Reuse der bestehenden Form-Validierungen, Pflichtfelder und Upload-Handling (Profilbild/Logos/Dokumente) inkl. Fehlermeldungen.
- **Suche & Ergebnislisten**: Postleitzahl/Ort-Suche, Filterlogik und Paging von der Web-App übernehmen; Ergebnis-Karten mit denselben Kennzahlen (freie Plätze, Kinder, Altersbereich).
- **Detailansicht einer Tagespflegeperson**: Kurzbeschreibung, Betreuungszeiten, freie Tage, Essensplan, Räume/Kontakt – Datenmodell wie im Web übernehmen, inkl. Berechnungen (z. B. Altersanzeige, Verfügbarkeiten).
- **Nachrichten/Chat**: Nachrichtenerstellung, Anhänge, Lesestatus und Sortierung wie im Web-Frontend; gleiche API-Endpunkte und Fehlerbehandlung nutzen.
- **Kontaktformular**: Felder und Validierungen aus dem Web-Frontend übernehmen; API-Route und Response-Handling 1:1 spiegeln.
- **Rechtstexte (Impressum/Datenschutz)**: Inhalte und Versionsstand aus dem Web übernehmen; automatische Updates einplanen (z. B. per CMS/API).

## Technische Schritte zur Logik-Übernahme
1. **Schnittstellen nachziehen**: API-Client/Services aus dem Web-Frontend importieren oder nachbauen (inkl. Interceptors, Auth-Refresh, Error Mapping).
2. **Validierungen übernehmen**: Re-use der Schema-Validierungen (z. B. Zod/Yup) oder identische Regeln in der Mobile-App abbilden.
3. **Feature-Flags/Berechtigungen**: Prüfen, ob bestimmte UI-Elemente im Web hinter Flags liegen; dieselben Flags für Mobile konsumieren.
4. **Upload-Handling**: Datei-Uploads (Bilder/PDFs) über die gleichen Endpunkte und Limits implementieren; Progress/Retry-Logik übernehmen.
5. **Observability**: Events/Logs/Tracing analog zum Web-Frontend senden (Screen Views, CTA-Klicks, Fehlermeldungen), damit Dashboards vergleichbar bleiben.
6. **QA-Parität**: Gegen dieselben E2E-/Regression-Testszenarien wie das Web testen (Login, Profil speichern, Nachricht senden, Upload).

## Übergabe an das Mobile-Backlog
- Für jeden oben genannten Bereich ein Ticket mit Akzeptanzkriterien anlegen: "Mobile verhält sich identisch wie Web bei ...".
- Querverweise auf die konkrete Datei/Funktion im Web-Frontend hinterlegen (Validierungsschemas, Services, Utility-Funktionen).
- Mockups als Referenz für Layout/Copy nutzen, aber Logik ausschließlich vom Web-Frontend ableiten.
