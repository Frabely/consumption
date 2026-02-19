# Login Overhaul Umsetzungsplan

Ziel: Nutzer sollen beim Start der App in der Regel eingeloggt bleiben und nicht jedes Mal die PIN erneut eingeben muessen.

Status-Legende:
- `offen`: noch nicht umgesetzt
- `umgesetzt`: abgeschlossen und verifiziert
- `blockiert`: derzeit nicht umsetzbar, Entscheidung offen

## Rahmen
- Branch fuer die Umsetzung: `feature/login-overhaul` (separat zur Planung)
- Diese Datei dient nur der aktiven Umsetzung und wird nach Abschluss wieder geloescht.

## Schrittplan

| Nr. | Schritt | Status | Umsetzung/Notizen |
|---|---|---|---|
| 1 | Auth-Zielbild finalisieren: Session-Verhalten, Ablaufzeit, Logout-Regeln, Fehlerfaelle | offen | Noch offen |
| 2 | Auth-Status im Store definieren (`unknown`, `authenticated`, `unauthenticated`) | offen | Noch offen |
| 3 | Session-Persistenz einbauen (z. B. `localStorage` mit `user`, `expiresAt`, `version`) | offen | Noch offen |
| 4 | Session-Rehydration beim App-Start einbauen (vor Render von Login/Home) | offen | Noch offen |
| 5 | Start-Flow absichern: solange Status `unknown` nur Loader/Splash rendern | offen | Noch offen |
| 6 | Login-Flow anpassen: bei Erfolg Session schreiben, Store konsistent setzen | offen | Noch offen |
| 7 | Logout-Flow anpassen: Session sicher entfernen, Store resetten, sauber redirecten | offen | Noch offen |
| 8 | Session-Validierung ergaenzen (leichtgewichtig gegen Backend/Firebase), inkl. Fallback bei Fehlern | offen | Noch offen |
| 9 | Session-Ablauf behandeln (abgelaufen -> Logout/Relogin) | offen | Noch offen |
| 10 | Guarding fuer geschuetzte Bereiche vereinheitlichen (Home/BuildingConsumption) | offen | Noch offen |
| 11 | Tests ergaenzen: Persistenz, Rehydration, Expiry, Logout, Guards (Integration priorisiert) | offen | Noch offen |
| 12 | Manuelle QA-Checkliste ausfuehren (Reload, Browser-Neustart, Offline/Online, Rollenwechsel) | offen | Noch offen |
| 13 | Dokumentation aktualisieren (kurz in AGENTS/README falls relevant) | offen | Noch offen |
| 14 | Abschluss: Diese Datei loeschen, sobald alle Punkte umgesetzt und gemerged sind | offen | Noch offen |

## Definition of Done
- App startet ohne erneuten Login, solange Session gueltig ist.
- Bei ungueltiger/abgelaufener Session ist der Nutzer sauber ausgeloggt.
- Logout entfernt Session und State vollstaendig.
- Kritische Flows sind durch Tests abgedeckt.
- Keine Regressionen in Navigation und Rollen-Logik.

## Aenderungslog
- 2026-02-19: Datei erstellt.
