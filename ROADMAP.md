# Produkt-Roadmap

## 1. Bugfixes
- High Priority: Home-Loading-Spinner wird hinter den Display-Items gerendert; Spinner muss im Home-View immer klar sichtbar im Vordergrund liegen.
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
- Filter-UX verbessern: Filtermoeglichkeiten in einen Header-Bereich mit Zuklapp-Funktion verschieben (insb. fuer mobile mehr Platz fuer Inhalte).
- Menu-UX verbessern: Beim Auswaehlen eines Autos das Menu sofort automatisch schliessen.
- Spinner-UX verbessern: Loading-Spinner visuell und funktional ueberarbeiten (klarer Status, ruhigeres Verhalten, konsistente Groessen/Abstaende).
- WebApp-Layout verbessern: Im installierten WebApp-Modus den Bereich oben (statt URL-/Browser-Header) mit dem App-Hintergrund gestalten, damit der Übergang nahtlos wirkt.

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
  - Kurzfristige Regel (Phase 1):
    - Kein Login bei Offline/Netzwerkfehlern.
    - Nutzer bekommt eine klare Meldung, dass Login ohne Verbindung aktuell nicht moeglich ist.

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

### 3.3 Offline AddData & Sync Queue
- Ziele:
  - AddData auch ohne Internet nutzbar machen.
  - Eintraege lokal zwischenspeichern und spaeter automatisch synchronisieren.
  - Datenverluste und stille Fehlschlaege bei Offline-Nutzung vermeiden.
- Wichtige Vorbedingung:
  - Bevor Offline-AddData umgesetzt wird, muss die App offline ueberhaupt nutzbar startbar sein
    (App-Shell-Caching, gueltige lokal wiederherstellbare Session fuer bekannte Nutzer, lokal verfuegbare Basisdaten wie Cars/LoadingStations).
  - Wenn diese Vorbedingung nicht erfuellt ist, ist Offline-AddData funktional nicht erreichbar.
- Schrittweise Umsetzung:
  - Schritt 0: Offline-Zugaenglichkeit der App sicherstellen
    - PWA/App-Shell-Caching fuer Start ohne Netzwerk vorbereiten.
    - Session-Restore-Strategie fuer Offline festlegen (nur bekannte, bereits verifizierte Sessions; keine Neulogins offline).
    - Minimal notwendige Stammdaten lokal cachen, damit Kernmasken bedienbar sind.
    - Klaren Fallback-Status definieren, wenn keine gueltige lokale Session/Datenbasis vorhanden ist.
  - Schritt 1: Outbox-Architektur definieren
    - Lokales Persistenzmodell fuer pending Eintraege festlegen (`IndexedDB` bevorzugt).
    - Felder fuer Idempotenz/Status definieren (`clientMutationId`, `pending/synced/failed/conflict`).
  - Schritt 2: Save-Flow in AddData entkoppeln
    - Einheitlichen `saveCarData`-Flow einfuehren (online direkt, offline in Outbox).
    - Klare Fehlerpfade fuer Netzwerk-/Validierungsfehler trennen.
  - Schritt 3: Hintergrund-Sync aufbauen
    - Sync bei App-Start, Reconnect (`online`-Event) und optional periodisch anstossen.
    - Retry mit Backoff fuer temporäre Fehler implementieren.
  - Schritt 4: Konfliktlogik definieren
    - Kilometerstand-Konflikte beim spaeten Sync erkennen.
    - Konflikte als `conflict` markieren und bearbeitbar machen statt still zu verwerfen.
  - Schritt 5: UX fuer Offline/Pending ausbauen
    - Pending/Synced/Failed sichtbar im UI kennzeichnen.
    - Ausstehende Eintraege im Menu/Screen zaehlen und nutzerfreundlich erklaeren.
    - Aktionen fuer `Erneut senden` / `Bearbeiten` / `Verwerfen` anbieten.
  - Schritt 6: Tests und Rollout
    - Integrationstests fuer Offline-Save, Reconnect-Sync, Duplicate-Schutz und Konflikte.
    - Rollout hinter Feature-Flag, danach stufenweise Aktivierung und Monitoring.

## 4. Infrastructure
- Test-Infrastruktur weiter haerten (weniger fragiles Hook-Mocking, mehr stabile Interaction-Tests).
- Dedizierten E2E-Testserver einführen (Mock-Backend/Fixtures zentral, keine verteilten Service-Mocks im Produktivcode).
- Orchestrierungs-Tests fuer `app/page.tsx` ergaenzen: Rollout-off-Verhalten, Session-Expiry-Logout, Cross-Tab-Logout und Guard-Redirects explizit als Komponententests absichern.
- Coverage-Gates pro kritischem Bereich definieren (mind. Branch-Coverage fuer Kernfluesse).
- CI-Pipeline erweitern:
  - verpflichtender Lint + Test + Coverage-Report pro PR
  - schnellere Feedback-Zyklen (parallelisierte Testjobs).
- Logging/Monitoring vorbereiten (strukturierte Fehlerklassifikation).
- Technische Schuld planbar abbauen (regelmaessige Refactoring-Slots pro Sprint).
