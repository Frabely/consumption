# Login Overhaul Umsetzungsplan

Ziel: Nutzer sollen beim Start der App in der Regel eingeloggt bleiben und nicht jedes Mal die PIN erneut eingeben muessen.

Status-Legende:

- `offen`: noch nicht umgesetzt
- `umgesetzt`: abgeschlossen und verifiziert
- `blockiert`: derzeit nicht umsetzbar, Entscheidung offen

## Rahmen

- Branch fuer die Umsetzung: `feature/login-overhaul` (separat zur Planung)
- Diese Datei dient nur der aktiven Umsetzung und wird nach Abschluss wieder geloescht.
- Kein Persistieren sensibler Geheimnisse im Browser-Storage (nur notwendige Session-Metadaten).

## Entscheidungsfragen und Antworten

| ID  | Frage                                                                         | Entscheidung                                                            | Status      |
| --- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------- |
| D1  | Session-Typ (nur lokal persistiert vs. serverseitig validiert bei Start)      | Lokale Session + Validierung beim App-Start                             | entschieden |
| D2  | Session-Dauer (z. B. 7/14/30 Tage)                                            | 90 Tage                                                                 | entschieden |
| D3  | Expiry-Strategie (fix ab Login vs. rolling bei Aktivitaet)                    | Rolling Expiry bei Nutzung                                              | entschieden |
| D4  | Verhalten bei abgelaufener Session (sofort Logout vs. Grace-Period)           | Sofort Logout + Login-Screen                                            | entschieden |
| D5  | Verhalten bei Offline-Start / Offline-Login-Request                           | Phase 1: kein Login bei Offline/Netzwerkfehler; klare Meldung an Nutzer | entschieden |
| D6  | Persistenz-Scope (nur User+Role+DefaultCar vs. mehr)                          | Minimal: userId, role, defaultCar, expiresAt, schemaVersion             | entschieden |
| D7  | Rehydration-Validierung (strict verwerfen bei kleinsten Fehlern vs. tolerant) | Strict: bei Fehler Session verwerfen                                    | entschieden |
| D8  | Cross-Tab-Verhalten (Logout in allen Tabs sofort)                             | Logout/Reset in allen Tabs sofort synchronisieren                       | entschieden |
| D9  | Guard-Verhalten fuer BuildingConsumption bei Rollenwechsel                    | Bei Role-Downgrade sofort aus BuildingConsumption heraus                | entschieden |
| D10 | Feature-Flag fuer Rollout (ja/nein)                                           | Ja, mit gestaffeltem Rollout                                            | entschieden |
| D11 | Session-Speicherort (`localStorage` vs. `sessionStorage`)                     | localStorage                                                            | entschieden |
| D12 | Logging/Monitoring-Tiefe (minimal vs. erweitert)                              | Erweitert: Events + Errors                                              | entschieden |
| D13 | PIN-UX bei Fehlern (generisch vs. genaue Fehlermeldung)                       | Generische Fehlermeldung                                                | entschieden |
| D14 | Sicherheitsregel bei manipulierten Session-Daten                              | Sofort verwerfen + Logout + Warn-Log                                    | entschieden |

## Ergebnis Schritt 1: Auth-Zielbild (verbindlich)

### Session-Verhalten

- App-Start:
  - Session aus `localStorage` lesen.
  - Lokal strikt validieren (Schema, Pflichtfelder, Typen, Ablauf).
  - Bei gueltiger Session: Store hydrieren, Status `authenticated`.
  - Bei ungueltiger Session: Session loeschen, Status `unauthenticated`.
- Start-Validierung gegen Backend/Firebase:
  - Bei Online-Verfuegbarkeit Session validieren.
  - Phase 1: Bei Offline/Netzwerkfehler kein Login; stattdessen klare Meldung anzeigen.
  - Spaetere Ausbaustufe: Offline-Session-Verhalten erneut einfuehren, sobald technisch freigegeben.

### Ablaufzeit / Expiry

- Session-Dauer: 90 Tage.
- Strategie: Rolling Expiry bei Nutzung.
- Abgelaufene Session: sofort Logout und Login-Screen.

### Logout-Regeln

- Logout loescht lokale Session-Daten vollstaendig.
- Redux/Auth-State wird auf definierten Ausgangszustand zurueckgesetzt.
- Logout wird per Cross-Tab-Sync auf allen offenen Tabs gespiegelt.

### Fehlerfaelle und Sicherheitsverhalten

- Manipulierte/ungueltige Session-Daten:
  - Sofort verwerfen, ausloggen, Warn-Log schreiben.
- Backend-Validierung faellt fehl:
  - Session nicht blind behalten; bei harter Invalidierung ausloggen.
  - Bei temporarem Netzfehler im Login-Flow nicht einloggen und Nutzer eindeutig informieren.
- Rollenwechsel:
  - Bei Role-Downgrade sofort aus geschuetzten Bereichen (z. B. BuildingConsumption) herausfuehren.

### UI/UX-Ziel

- Nutzer bleibt in der Regel eingeloggt und muss beim normalen Start nicht erneut PIN eingeben.
- Fehlermeldungen bleiben generisch (keine unnÃ¶tige Detailpreisgabe).

## Ergebnis Schritt 2: Session-Contract (verbindlich)

- Implementiert in:
  - `domain/authSessionContract.ts`
  - `domain/authSessionContract.spec.ts`
- Enthalten:
  - Strikte Validierung des Persistenz-Schemas (Version, Pflichtfelder, Typen).
  - Migrations-Entry-Point von Legacy v0 (`key`) auf v1 (`userId`).
  - Einheitlicher Parse-Flow mit Validierungsresultat fuer die nachfolgende Rehydration.

## Ergebnis Schritt 3: Auth-Status im Store (verbindlich)

- Implementiert in:
  - `store/reducer/authStatus.tsx`
  - `store/reducer/authStatus.spec.ts`
  - `store/store.tsx`
  - `store/selectors.ts`
- Enthalten:
  - Neuer zentraler `authStatus` Slice mit den Statuswerten `unknown`, `authenticated`, `unauthenticated`.
  - Explizite Actions zum Setzen der Stati (`setAuthStatus*`).
  - Zentraler Selector `selectAuthStatus` fuer nachfolgende Rehydration-/Guard-Implementierung.

## Ergebnis Schritt 4: Session-Persistenz (verbindlich)

- Implementiert in:
  - `domain/authSessionStorage.ts`
  - `domain/authSessionStorage.spec.ts`
- Enthalten:
  - Aufbau einer persistierbaren Session aus User-Daten (`buildPersistedAuthSession`).
  - Speichern/Lesen/Loeschen der Session in `localStorage` (testbar ueber `StorageLike`).
  - Defensives Verhalten bei fehlender Storage-Umgebung und kaputten JSON-Payloads.

## Ergebnis Schritt 5: Versionierte Rehydration mit Fallback (verbindlich)

- Implementiert in:
  - `domain/authSessionRestore.ts`
  - `domain/authSessionRestore.spec.ts`
- Enthalten:
  - Einheitliche Rehydration-Entscheidung aus persisted Session (`authenticated` / `unauthenticated`).
  - Fallback-Verhalten fuer Legacy/ungueltige/abgelaufene Sessions.
  - Invalid/Expired Sessions werden explizit als Cleanup-Fall markiert und geloescht.

## Ergebnis Schritt 6: Session-Restore beim App-Start (verbindlich)

- Implementiert in:
  - `domain/authStartup.ts`
  - `domain/authStartup.spec.ts`
  - `app/page.tsx`
- Enthalten:
  - App-Start-Flow liest Session-Decision und setzt den Store fruehzeitig.
  - Bei gueltiger Session werden `currentUser`, `currentCar` und `authStatus=authenticated` gesetzt.
  - Bei fehlender/ungueltiger Session wird auf `authStatus=unauthenticated` gesetzt.

## Ergebnis Schritt 7: Startup-Flow-Absicherung mit Loader (verbindlich)

- Implementiert in:
  - `domain/authBootGuard.ts`
  - `domain/authBootGuard.spec.ts`
  - `app/page.tsx`
- Enthalten:
  - Solange `authStatus=unknown`, wird ein dedizierter Boot-Loader gerendert.
  - Home/Login werden erst nach Abschluss des Startup-Restore-Flows gerendert.
  - Verhindert Login-Flicker waehrend der initialen Session-Wiederherstellung.

## Ergebnis Schritt 8: Login-Flow mit Session-Persistenz (verbindlich)

- Implementiert in:
  - `components/features/home/Login/Login.logic.ts`
  - `components/features/home/Login/Login.spec.ts`
- Enthalten:
  - Bei erfolgreichem Login wird eine persistierbare Session gebaut und gespeichert.
  - Login-Flow setzt danach `authStatus=authenticated` explizit.
  - Session-Write ist testbar entkoppelt (`buildPersistedAuthSessionFn`, `persistAuthSessionFn`).

## Ergebnis Schritt 9: Logout-Flow mit Session-Cleanup (verbindlich)

- Implementiert in:
  - `domain/authLogout.ts`
  - `domain/authLogout.spec.ts`
  - `components/features/home/Menu/Menu.tsx`
  - `components/features/building/MenuBuilding/MenuBuilding.tsx`
- Enthalten:
  - Zentraler Logout-Flow entfernt persistierte Session-Daten.
  - Logout setzt `authStatus=unauthenticated` und navigiert nach Home.
  - Optionaler Dataset-Reset fuer Home-Logout ist zentral steuerbar.

## Ergebnis Schritt 10: Session-Validierung mit Fehler-Fallback (verbindlich)

- Implementiert in:
  - `domain/authSessionValidation.ts`
  - `domain/authSessionValidation.spec.ts`
  - `app/page.tsx`
- Enthalten:
  - Aktive Session wird gegen Backend/Firebase validiert.
  - Harte Invalidierung fuehrt zu Session-Cleanup und `authStatus=unauthenticated`.
  - Temporaere Validierungsfehler liefern einen definierten `unavailable`-Fallback ohne harten Logout.

## Ergebnis Schritt 11: Session-Ablaufbehandlung zur Laufzeit (verbindlich)

- Implementiert in:
  - `domain/authSessionExpiry.ts`
  - `domain/authSessionExpiry.spec.ts`
  - `app/page.tsx`
- Enthalten:
  - Persistierte Session wird waehrend laufender App periodisch auf Ablauf geprueft.
  - Bei Ablauf erfolgt automatischer Logout mit Session-Cleanup und Redirect.
  - Ablauf-Trigger ist idempotent (einmalig pro Ablaufzustand).

## Ergebnis Schritt 12: Guards fuer geschuetzte Bereiche vereinheitlicht (verbindlich)

- Umgesetzte Artefakte:
  - `domain/authPageGuard.ts`
  - `domain/authPageGuard.spec.ts`
  - `app/page.tsx`
  - `components/features/building/pages/BuildingConsumption/BuildingConsumption.tsx`
- Verhalten:
  - Zentrale Guard-Entscheidung auf App-Ebene fuer Top-Level-Seiten.
  - Nicht-authentifizierte Nutzer werden immer auf `Page.Home` gefuehrt.
  - `Page.BuildingConsumption` ist nur fuer authentifizierte Admins erreichbar.
  - `BuildingConsumption` enthaelt keinen separaten Seitenzugriffs-Guard mehr; die Zugriffskontrolle erfolgt einheitlich zentral.

## Schrittplan

| Nr. | Schritt                                                                                             | Status    | Umsetzung/Notizen                                                                                        |
| --- | --------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Auth-Zielbild finalisieren: Session-Verhalten, Ablaufzeit, Logout-Regeln, Fehlerfaelle              | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 1: Auth-Zielbild (verbindlich)" und `docs/login-auth-target-state.md`. |
| 2   | Session-Contract definieren (`schemaVersion`, Felder, TTL, Validierungsregeln, Migrationsregeln)    | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 2: Session-Contract (verbindlich)".                                    |
| 3   | Auth-Status im Store definieren (`unknown`, `authenticated`, `unauthenticated`)                     | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 3: Auth-Status im Store (verbindlich)".                                |
| 4   | Session-Persistenz einbauen (z. B. `localStorage` mit `user`, `expiresAt`, `version`)               | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 4: Session-Persistenz (verbindlich)".                                  |
| 5   | Versionierte Rehydration inkl. Fallback: ungueltige/alte Session verwerfen und neu einloggen        | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 5: Versionierte Rehydration mit Fallback (verbindlich)".               |
| 6   | Session-Rehydration beim App-Start einbauen (vor Render von Login/Home)                             | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 6: Session-Restore beim App-Start (verbindlich)".                      |
| 7   | Start-Flow absichern: solange Status `unknown` nur Loader/Splash rendern                            | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 7: Startup-Flow-Absicherung mit Loader (verbindlich)".                 |
| 8   | Login-Flow anpassen: bei Erfolg Session schreiben, Store konsistent setzen                          | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 8: Login-Flow mit Session-Persistenz (verbindlich)".                   |
| 9   | Logout-Flow anpassen: Session sicher entfernen, Store resetten, sauber redirecten                   | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 9: Logout-Flow mit Session-Cleanup (verbindlich)".                     |
| 10  | Session-Validierung ergaenzen (leichtgewichtig gegen Backend/Firebase), inkl. Fallback bei Fehlern  | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 10: Session-Validierung mit Fehler-Fallback (verbindlich)".            |
| 11  | Session-Ablauf behandeln (abgelaufen -> Logout/Relogin)                                             | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 11: Session-Ablaufbehandlung zur Laufzeit (verbindlich)".              |
| 12  | Guarding fuer geschuetzte Bereiche vereinheitlichen (Home/BuildingConsumption)                      | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 12: Guards fuer geschuetzte Bereiche vereinheitlicht (verbindlich)". |
| 13  | Cross-Tab-Sync ergaenzen (Logout/Session-Reset via `storage`-Event)                                 | offen     | Noch offen                                                                                               |
| 14  | Feature-Flag fuer Rollout einbauen (schneller Rollback ohne Hotfix-Refactor)                        | offen     | Noch offen                                                                                               |
| 15  | Logging/Monitoring ergaenzen (Login-Erfolg, Rehydration-Erfolg, Session-Invalidierung, Fehlerquote) | offen     | Noch offen                                                                                               |
| 16  | Tests ergaenzen: Persistenz, Rehydration, Expiry, Logout, Guards (Integration priorisiert)          | offen     | Noch offen                                                                                               |
| 17  | Manuelle QA-Checkliste ausfuehren (Reload, Browser-Neustart, Offline/Online, Rollenwechsel)         | offen     | Noch offen                                                                                               |
| 18  | Dokumentation aktualisieren (kurz in AGENTS/README falls relevant)                                  | offen     | Noch offen                                                                                               |
| 19  | Abschluss: Diese Datei loeschen, sobald alle Punkte umgesetzt und gemerged sind                     | offen     | Noch offen                                                                                               |

## Definition of Done

- App startet ohne erneuten Login, solange Session gueltig ist.
- Bei ungueltiger/abgelaufener Session ist der Nutzer sauber ausgeloggt.
- Logout entfernt Session und State vollstaendig.
- Session-Schema ist versioniert und robust gegen alte/ungueltige Daten.
- Rollout ist ueber Feature-Flag kontrollierbar und schnell deaktivierbar.
- Kritische Flows sind durch Tests abgedeckt.
- Keine Regressionen in Navigation und Rollen-Logik.

## Aenderungslog

- 2026-02-19: Datei erstellt.
- 2026-02-19: Schritt 1 als verbindliche technische Spezifikation in `docs/login-auth-target-state.md` festgehalten.
- 2026-02-19: Schritt 2 als Code-Artefakt mit Validator/Migration in `domain/authSessionContract.ts` umgesetzt.
- 2026-02-19: Schritt 3 mit zentralem `authStatus` Slice/Selector im Store umgesetzt.
- 2026-02-19: Schritt 4 mit persistenter Session-Storage-Logik in `domain/authSessionStorage.ts` umgesetzt.
- 2026-02-19: Schritt 5 mit versionierter Restore/Fallback-Entscheidung in `domain/authSessionRestore.ts` umgesetzt.
- 2026-02-19: Schritt 6 mit App-Start-Restore in `domain/authStartup.ts` und `app/page.tsx` umgesetzt.
- 2026-02-19: Schritt 7 mit Loader-Gating fuer `authStatus=unknown` in `app/page.tsx` umgesetzt.
- 2026-02-19: Schritt 8 mit Login-Session-Persistenz und `authStatus`-Setzen umgesetzt.
- 2026-02-19: Schritt 9 mit zentralem Logout-Cleanup in `domain/authLogout.ts` umgesetzt.
- 2026-02-19: Schritt 10 mit Backend-Session-Validierung/Fallback in `domain/authSessionValidation.ts` umgesetzt.
- 2026-02-19: Schritt 11 mit Session-Expiry-Watcher und Auto-Logout in `domain/authSessionExpiry.ts` umgesetzt.
- 2026-02-19: Schritt 12 mit zentraler Page-Guard-Logik in `domain/authPageGuard.ts` und App-Integration umgesetzt.
