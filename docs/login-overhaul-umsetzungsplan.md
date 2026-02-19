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

## Schrittplan

| Nr. | Schritt | Status | Umsetzung/Notizen |
|---|---|---|---|
| 1 | Auth-Zielbild finalisieren: Session-Verhalten, Ablaufzeit, Logout-Regeln, Fehlerfaelle | offen | Noch offen |
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
