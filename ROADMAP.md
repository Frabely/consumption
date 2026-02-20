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
- Filter-UX verbessern: Filtermoeglichkeiten in einen Header-Bereich mit Zuklapp-Funktion verschieben (insb. fuer mobile mehr Platz fuer Inhalte).
- Menu-UX verbessern: Beim Auswaehlen eines Autos das Menu sofort automatisch schliessen.
- WebApp-Layout verbessern: Im installierten WebApp-Modus den Bereich oben (statt URL-/Browser-Header) mit dem App-Hintergrund gestalten, damit der Ãœbergang nahtlos wirkt.

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
    - GroÃŸe Komponenten in fokussierte Teilkomponenten aufteilen.
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
    - Retry mit Backoff fuer temporÃ¤re Fehler implementieren.
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

### 3.4 Data/Loading Architecture Stabilization (Tests-First)
- Ziele:
  - Globales Loading-Verhalten deterministisch und wartbar machen.
  - Verteilte mutable App-Daten (`cars`, `houses`, `loadingStations`) in klare, testbare Datenfluesse ueberfuehren.
  - UI-Flows robuster gegen Race Conditions und inkonsistente Ladezustaende machen.
- Vorgehen (tests-first):
  - Schritt 1: Test-Sicherungsnetz vor Refactoring
    - Integrationstests fuer kritische Flows erstellen/haerten:
      - Login + Initial-Load
      - Car-Wechsel + DataSet-Reload
      - AddData/ChangeData + anschliessender UI-Refresh
      - CSV-Downloads + Fehlerpfade
    - Vor Refactoring den Ist-Zustand in diesen Flows absichern.
  - Schritt 2: Loading-Orchestrierung zentralisieren
    - Einheitliche Loading-Utility/Fassade einfuehren (z. B. `runWithLoading`).
    - Direkte, verteilte `setIsLoading(true/false)`-Aufrufe schrittweise reduzieren.
    - Einheitliche Regeln fuer Delay/Overlay/Abschluss definieren.
  - Schritt 3: Datenquellen konsolidieren
    - Mutable Modulvariablen durch expliziten Store-/Cache-Layer ersetzen.
    - Definierte Refresh-/Invalidation-Pfade pro DomÃ¤ne (`cars`, `houses`, `loadingStations`, `dataSet`) einfuehren.
  - Schritt 4: Komponenten entkoppeln
    - Komponenten sollen keine Fetch-Orchestrierung enthalten.
    - Service-/Facade-Hooks mit standardisiertem Statusmodell nutzen (`idle/loading/success/error`).
  - Schritt 5: Regression & Rollout
    - Relevante E2E-/Integrationstests pro Inkrement ausfuehren.
    - In kleinen, nachvollziehbaren PR-Schritten mergen.

### 3.5 Test Excellence & Reliability Program
- Ziele:
  - Teststrategie auf produktionsnahe Zuverlaessigkeit heben (stabil, reproduzierbar, aussagekraeftig).
  - Kritische Domains mit harten Coverage- und Qualitaets-Gates absichern.
  - Regressionen frueh erkennen und Flakiness systematisch abbauen.
- Schrittweise Umsetzung:
  - Schritt 1: Harte Coverage-Gates pro kritischer Domain
    - Fuer Auth, AddData, Building und Session/Loading klare Branch-Coverage-Schwellen definieren.
    - Fail-fast in CI bei Unterschreitung der Grenzwerte.
  - Schritt 2: E2E-Vervollstaendigung Building-Kernflows
    - Add/Edit/Delete/Reorder fuer Floors/Rooms/Fields als stabile E2E-Suiten ausbauen.
    - Building CSV und Validierungs-/Fehlerpfade vollstaendig absichern.
  - Schritt 3: Nightly Matrix + Flake-Management
    - Nightly-Laeufe fuer mehrere Browser/Viewport-Klassen einfuehren.
    - Flake-Reporting, Quarantaene-Label und SLA fuer Reparatur etablieren.
  - Schritt 4: Dedizierter Mock-Backend-Testserver
    - Zentralen Testserver mit festen Handlern/Fixtures statt verteilter Service-Mocks aufbauen.
    - Konsistente API-Vertraege fuer Integration/E2E schaffen.
  - Schritt 5: Erweiterte Qualitaetstests
    - Accessibility-Smoke-Tests fuer Kernscreens (Fokus, Tastatur, ARIA-Basics).
    - Performance-Smoke-Checks fuer Login/Start/Home.
    - Contract-Tests zwischen Service-Layer und erwarteten Datenformen.

## 4. Infrastructure
- Test-Infrastruktur weiter haerten (weniger fragiles Hook-Mocking, mehr stabile Interaction-Tests).
- Dedizierten E2E-Testserver einfÃ¼hren (Mock-Backend/Fixtures zentral, keine verteilten Service-Mocks im Produktivcode).
- Orchestrierungs-Tests fuer `app/page.tsx` ergaenzen: Rollout-off-Verhalten, Session-Expiry-Logout, Cross-Tab-Logout und Guard-Redirects explizit als Komponententests absichern.
- Coverage-Gates pro kritischem Bereich definieren (mind. Branch-Coverage fuer Kernfluesse).
- CI-Pipeline erweitern:
  - verpflichtender Lint + Test + Coverage-Report pro PR
  - schnellere Feedback-Zyklen (parallelisierte Testjobs).
- Logging/Monitoring vorbereiten (strukturierte Fehlerklassifikation).
- Technische Schuld planbar abbauen (regelmaessige Refactoring-Slots pro Sprint).
