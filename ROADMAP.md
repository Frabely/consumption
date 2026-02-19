# Produkt-Roadmap

## 1. Bugfixes
- AddFloor: Interaktionen (Add/Edit/Remove/Reorder) robuster machen und gezielt auf Edge Cases testen.
- Modal/Select: Keyboard- und Focus-Verhalten (Escape, Enter, Outside-Click, Tab-Reihenfolge) vereinheitlichen.
- CSV-Downloads: Datumswechsel und No-Data-Handling in beiden Flows (`DownloadCsv`, `DownloadBuildingCsv`) konsistent behandeln.
- ListItem Long-Press: Touch-/Mouse-Verhalten auf mobilen Browsern stabilisieren (kein versehentliches Doppel-Triggern).
- Error-Handling: Nutzerfreundliche Fehlermeldungen statt stiller Fehlerpfade bei Firebase-Aufrufen.

## 2. Quality-of-Life Features
- Globale Filterpersistenz (zuletzt gewaehltes Auto/Haus/Zeitraum merken).
- Schnellaktionen in Menues (z. B. zuletzt genutzte Exporte, direkter Sprung zu haeufigen Dialogen).
- Verbesserte Lade-/Leerstates mit klaren Handlungsoptionen.
- Inline-Hilfen und Validation-Feedback in komplexen Dialogen.
- Accessibility-Polish: bessere Screenreader-Texte, Tastaturbedienung und Fokus-Management.
- CSS-Variablen-Check und Konsolidierung: pruefen, dass Designwerte (insb. Farben/Spacing/Typografie) nicht hart codiert sind, um spaetere Color-Schema-Aenderungen zentral steuern zu koennen.

## 3. Grosse Features

### 3.1 Login Overhaul
- Ziele:
  - Klarer Auth-Flow fuer User/Admin.
  - Besseres Session-Handling und Fehlerfeedback.
  - Vorbereitung fuer spaetere Erweiterungen (z. B. MFA, Rollen-Scopes).
- Umfang:
  - Login-UI neu strukturieren.
  - Auth-Service-Layer staerken (Retry/Timeout/Error-Mapping).
  - Rollenlogik und Navigation nach Login konsolidieren.
  - Tests fuer Happy Path + Failure Path + Session Restore erweitern.

### 3.2 Building Consumption Overhaul
- Ziele:
  - Deutlich bessere Bedienbarkeit bei Floors/Rooms/Fields.
  - Klarere Datenfluesse und weniger UI-seitige Komplexitaet.
  - Solide Grundlage fuer Reporting/Exports.
- Schrittweise Umsetzung:
  - Schritt 1: Ist-Analyse und Zielbild
    - Bestehende Flows dokumentieren (Add/Edit/Delete/Reorder/Export).
    - Schmerzpunkte priorisieren (UX + Technik).
  - Schritt 2: Logik entkoppeln
    - UI-nahe Entscheidungen in `*.logic.ts` verschieben.
    - Seiteneffekte (Firebase/Redux) klar kapseln.
  - Schritt 3: UI in kleine Bausteine schneiden
    - Große Komponenten in fokussierte Teilkomponenten aufteilen.
    - Einheitliche Dialog- und Formular-Bausteine nutzen.
  - Schritt 4: Interaktionen stabilisieren
    - Long-Press, Selection, Reorder und Validation vereinheitlichen.
    - Einheitliches Error-/Loading-Verhalten umsetzen.
  - Schritt 5: Datenzugriff verbessern
    - Redundante Abfragen reduzieren.
    - Query-Pfade fuer Building-Daten konsolidieren.
  - Schritt 6: Testausbau
    - Echte Render-/Interaction-Tests fuer Kernfluesse.
    - Service- und Logiktests fuer Edge Cases.
  - Schritt 7: Rollout in Inkrementen
    - Erst kritische Dialoge/Flows, dann Restbereiche.
    - Nach jedem Inkrement: Regressionstest + UX-Abnahme.

## 4. Infrastructure
- Test-Infrastruktur weiter haerten (weniger fragiles Hook-Mocking, mehr stabile Interaction-Tests).
- Coverage-Gates pro kritischem Bereich definieren (mind. Branch-Coverage fuer Kernfluesse).
- CI-Pipeline erweitern:
  - verpflichtender Lint + Test + Coverage-Report pro PR
  - schnellere Feedback-Zyklen (parallelisierte Testjobs).
- Logging/Monitoring vorbereiten (strukturierte Fehlerklassifikation).
- Technische Schuld planbar abbauen (regelmaessige Refactoring-Slots pro Sprint).
