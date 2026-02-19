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

| ID | Frage | Entscheidung | Status |
|---|---|---|---|
| D1 | Session-Typ (nur lokal persistiert vs. serverseitig validiert bei Start) | Lokale Session + Validierung beim App-Start | entschieden |
| D2 | Session-Dauer (z. B. 7/14/30 Tage) | 90 Tage | entschieden |
| D3 | Expiry-Strategie (fix ab Login vs. rolling bei Aktivitaet) | Rolling Expiry bei Nutzung | entschieden |
| D4 | Verhalten bei abgelaufener Session (sofort Logout vs. Grace-Period) | Sofort Logout + Login-Screen | entschieden |
| D5 | Verhalten bei Offline-Start / Offline-Login-Request | Phase 1: kein Login bei Offline/Netzwerkfehler; klare Meldung an Nutzer | entschieden |
| D6 | Persistenz-Scope (nur User+Role+DefaultCar vs. mehr) | Minimal: userId, role, defaultCar, expiresAt, schemaVersion | entschieden |
| D7 | Rehydration-Validierung (strict verwerfen bei kleinsten Fehlern vs. tolerant) | Strict: bei Fehler Session verwerfen | entschieden |
| D8 | Cross-Tab-Verhalten (Logout in allen Tabs sofort) | Logout/Reset in allen Tabs sofort synchronisieren | entschieden |
| D9 | Guard-Verhalten fuer BuildingConsumption bei Rollenwechsel | Bei Role-Downgrade sofort aus BuildingConsumption heraus | entschieden |
| D10 | Feature-Flag fuer Rollout (ja/nein) | Ja, mit gestaffeltem Rollout | entschieden |
| D11 | Session-Speicherort (`localStorage` vs. `sessionStorage`) | localStorage | entschieden |
| D12 | Logging/Monitoring-Tiefe (minimal vs. erweitert) | Erweitert: Events + Errors | entschieden |
| D13 | PIN-UX bei Fehlern (generisch vs. genaue Fehlermeldung) | Generische Fehlermeldung | entschieden |
| D14 | Sicherheitsregel bei manipulierten Session-Daten | Sofort verwerfen + Logout + Warn-Log | entschieden |

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
- Fehlermeldungen bleiben generisch (keine unnötige Detailpreisgabe).

## Schrittplan

| Nr. | Schritt | Status | Umsetzung/Notizen |
|---|---|---|---|
| 1 | Auth-Zielbild finalisieren: Session-Verhalten, Ablaufzeit, Logout-Regeln, Fehlerfaelle | umgesetzt | Siehe Abschnitt "Ergebnis Schritt 1: Auth-Zielbild (verbindlich)" und `docs/login-auth-target-state.md`. |
| 2 | Session-Contract definieren (`schemaVersion`, Felder, TTL, Validierungsregeln, Migrationsregeln) | offen | Noch offen |
| 3 | Auth-Status im Store definieren (`unknown`, `authenticated`, `unauthenticated`) | offen | Noch offen |
| 4 | Session-Persistenz einbauen (z. B. `localStorage` mit `user`, `expiresAt`, `version`) | offen | Noch offen |
| 5 | Versionierte Rehydration inkl. Fallback: ungueltige/alte Session verwerfen und neu einloggen | offen | Noch offen |
| 6 | Session-Rehydration beim App-Start einbauen (vor Render von Login/Home) | offen | Noch offen |
| 7 | Start-Flow absichern: solange Status `unknown` nur Loader/Splash rendern | offen | Noch offen |
| 8 | Login-Flow anpassen: bei Erfolg Session schreiben, Store konsistent setzen | offen | Noch offen |
| 9 | Logout-Flow anpassen: Session sicher entfernen, Store resetten, sauber redirecten | offen | Noch offen |
| 10 | Session-Validierung ergaenzen (leichtgewichtig gegen Backend/Firebase), inkl. Fallback bei Fehlern | offen | Noch offen |
| 11 | Session-Ablauf behandeln (abgelaufen -> Logout/Relogin) | offen | Noch offen |
| 12 | Guarding fuer geschuetzte Bereiche vereinheitlichen (Home/BuildingConsumption) | offen | Noch offen |
| 13 | Cross-Tab-Sync ergaenzen (Logout/Session-Reset via `storage`-Event) | offen | Noch offen |
| 14 | Feature-Flag fuer Rollout einbauen (schneller Rollback ohne Hotfix-Refactor) | offen | Noch offen |
| 15 | Logging/Monitoring ergaenzen (Login-Erfolg, Rehydration-Erfolg, Session-Invalidierung, Fehlerquote) | offen | Noch offen |
| 16 | Tests ergaenzen: Persistenz, Rehydration, Expiry, Logout, Guards (Integration priorisiert) | offen | Noch offen |
| 17 | Manuelle QA-Checkliste ausfuehren (Reload, Browser-Neustart, Offline/Online, Rollenwechsel) | offen | Noch offen |
| 18 | Dokumentation aktualisieren (kurz in AGENTS/README falls relevant) | offen | Noch offen |
| 19 | Abschluss: Diese Datei loeschen, sobald alle Punkte umgesetzt und gemerged sind | offen | Noch offen |

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
