# Test-Roadmap (separat)

## Status (feature/tests-first-loading-data-architecture)
- Erledigt: Grundstruktur (`tests/unit`, `tests/integration`, `tests/fixtures`, `tests/factories`, `tests/helpers`, `tests/mocks/server`).
- Erledigt: Runner-Trennung (`npm run test:unit`, `npm run test:integration`, `npm run test:e2e`) inkl. Vitest-Setup pro Testtyp.
- Erledigt: Zentrale E2E-Fixtures/Factories/Helpers fuer Session-Seeding und Home-Aktionen.
- Erledigt: E2E-Kernfluesse erweitert (Login, Session-Restore, Car-Selection-Reopen, AddData-Hydration, CSV-Modal, Statistics-Tab).
- Erledigt: CI-Basisworkflow mit Quality-Gates (Type-Check, Lint, Docstring-Lint, Unit, Integration, Coverage) plus E2E-Smoke-Job.
- Offen fuer naechste Iterationen: Coverage-Gates pro kritischer Domain (harte Schwellwerte) + Nightly-Matrix/Flake-Reporting + dedizierter Mock-Backend-Server mit Handlern.


## 1. Ziele
- E2E-Absicherung aller Kernfunktionalitaeten mit stabilen, wartbaren Flows.
- Hohe und aussagekraeftige Unit-Testabdeckung fuer kritische Fachlogik.
- Klare Test-Infrastruktur mit reproduzierbarer Datenbasis und wenig Flakiness.
- Schnelle CI-Feedback-Zyklen mit klaren Quality-Gates.

## 2. Testprinzipien
- Tests-first bei Refactorings an kritischen Flows.
- Nutzerpfade vor Implementierungsdetails testen.
- Keine verteilten Test-Mocks im Produktivcode; Testdaten zentral kapseln.
- Deterministische Tests: feste Seeds, feste Zeit, kontrollierte Netzwerkeffekte.

## 3. E2E-Programm (Kernfunktionalitaeten)

### 3.1 Auth & Session
- Login erfolgreich/fehlerhaft.
- Session-Restore bei App-Start.
- Cross-Tab Logout/Session invalid.
- Guard-Redirects nach Rolle/Page.

### 3.2 Home (Cars, AddData, Display, Statistics)
- Car-Select inkl. Browser-Neustart/Session-Restore.
- AddData und ChangeData (Happy Path + Validierungsfehler + Fehlerpfade).
- Display-Reload nach Add/Change und korrekte Kilometer/Datensatz-Konsistenz.
- Statistics Filter (Zeitraum/Preisfaktor) inkl. Lade- und Leerstates.
- CSV Download (mit/ohne Daten).

### 3.3 Building
- House-Select + Reload.
- Add/Edit/Delete/Reorder Floors/Rooms/Fields.
- AddFloorData Save/Delete inkl. Validierung.
- Building CSV Download (mit/ohne Daten).

### 3.4 Plattform-/UX-kritische Flows
- Mobile Keyboard Eingabe im Login (Android/iOS).
- PWA/WebApp-Standalone Layout/Safe-Area Verhalten.
- Loading Overlay in kritischen API-Phasen sichtbar/konsistent.

## 4. Unit-Test Strategie (hohe Abdeckung)
- Prioritaet A: reine Domain-/Logic-Module (`*.logic.ts`, Auth-Flows, Validierung, Mapping).
- Prioritaet B: Service-Layer (Datenzugriff, Fehlerbehandlung, Mapping, Retry/Fallback).
- Prioritaet C: Utility-Layer (Date/Parse/Format/Selectors).
- Coverage-Ziele:
  - Gesamt: >= 85%
  - Kritische Domains (Auth, AddData, Building, Loading/Session): >= 90% Branch-Coverage

## 5. Integrationstests
- Komponentennahe Flows mit echten Render-/Interaktionen.
- Fokus auf orchestrierende Knoten (z. B. `app/page.tsx`, Home/Building Pages).
- API/Store/Modal Interplay gegen Regressionen absichern.

## 6. Test-Infrastruktur & Ordnerstruktur

### 6.1 Struktur
- `tests/unit/**` fuer domain-/utility-lastige Unit-Tests.
- `tests/integration/**` fuer Render-/Flow-Tests ueber Feature-Grenzen.
- `e2e/**` ausschliesslich fuer Browser-Ende-zu-Ende-Flows.
- `tests/fixtures/**` zentrale Testdaten (Users, Cars, Houses, DataSets).
- `tests/factories/**` Builder/Factory-Funktionen fuer variantenreiche Testobjekte.
- `tests/mocks/server/**` zentraler Mock-Server/Testserver (statt verstreuter Service-Mocks).
- `tests/helpers/**` gemeinsame Helpers (render, auth-seeding, clock, network, assertions).

### 6.2 Konfiguration
- Unit/Integration und E2E strikt getrennt ausfuehren.
- Einheitliche Test-Env-Initialisierung (`setup` pro Testtyp).
- Zeit-/Random-Kontrolle standardisieren (`fake timers`, seedbarer Random).

## 7. Datenstrategie fuer Tests
- Zentrale Fixture-Saetze pro DomÃ¤ne (auth/home/building).
- Deterministische IDs/Zeiten fuer reproduzierbare Erwartungen.
- Kein implizites Sharing von mutablem Zustand zwischen Tests.

## 8. CI / Quality Gates
- Pflicht pro PR:
  - `npx tsc --noEmit`
  - `npm run lint`
  - Unit + Integration + relevante E2E-Smoke-Suite
  - Coverage-Report mit Schwellwertpruefung
- Nightly:
  - Voller E2E-Lauf auf mehreren Browser/Viewport-Klassen
  - Flake-Report inkl. Retry-Statistik

## 9. Flake-Management
- Flaky-Test Label + Quarantaene-Prozess mit SLA zur Reparatur.
- Test-Retries nur fuer Diagnose, nicht als Dauerloesung.
- Stabilitaetsmetriken tracken (Pass-Rate, Dauer, Timeout-Haeufung).

## 10. Was noch wichtig ist (zusaetzlich)
- Contract-Tests zwischen Service-Layer und erwarteten Datenformen.
- Accessibility-Smoke-Tests fuer Kernscreens (Fokus, Tastatur, ARIA-Basics).
- Performance-Smoke-Checks fuer Start/Login/Home (keine harten Perf-Regressions).
- Test-Ownership pro Feature-Bereich definieren.
- Regelmaessige Test-Cleanup-Slots (alte/duplizierte/fragile Tests abbauen).

## 11. Umsetzung in Phasen
- Phase 1: Test-Infrastruktur + Fixtures + 5 kritischste E2E-Flows.
- Phase 2: Unit-Coverage auf kritischen Domains anheben.
- Phase 3: Integrationstests fuer orchestrierende Seiten/Flows ausbauen.
- Phase 4: CI-Gates verschaerfen + Flake-Management etablieren.
