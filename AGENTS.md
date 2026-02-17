# AGENTS.md

Diese Datei definiert verbindliche Arbeitsregeln fuer dieses Repository.
Ziel: konsistenter Code-Style, robuste Implementierungen und wenig Regressionen.

## 1. Grundprinzipien
- Bevorzuge kleine, klar getrennte Aenderungen pro Thema.
- Korrigiere Ursachen, nicht nur Symptome.
- Keine stillen "quick fixes", die technische Schulden erhoehen.
- Halte Verhalten stabil, ausser eine Verhaltensaenderung ist explizit gewuenscht.
- Nutze Serena (MCP) so oft wie moeglich fuer Analyse, Navigation und Code-Aenderungen im Projekt.
- Bewerte Architektur, Lesbarkeit, Wartbarkeit und Risikomanagement konsequent aus Senior-Developer-Sicht.
- Wende SOLID- und DRY-Prinzipien konsequent an.
- Bevorzuge eine klare, gut erweiterbare Architektur mit sauber getrennten Verantwortlichkeiten.

## 2. TypeScript-Standards
- `strict` bleibt aktiv; keine Aufweichung in `tsconfig.json`.
- Keine neuen `any`-Typen. Falls unvermeidbar: lokal kapseln und begruenden.
- Nutze konkrete Rueckgabetypen fuer exportierte Funktionen.
- Bevorzuge `type`/`interface` statt impliziter Objektformen in komplexen Datenstrukturen.
- Keine ungenutzten Variablen, Imports oder Typen einchecken.

## 3. React / Next.js
- Komponenten als kleine, fokussierte Einheiten bauen.
- `useEffect` immer mit korrekter Dependency-Liste; keine unbeabsichtigten Endlosschleifen.
- Keine Side-Effects waehrend Render.
- Props und State minimal halten; abgeleitete Werte per `useMemo` nur wenn noetig.
- Bei Client Components nur dann `'use client'`, wenn Hooks/Browser-APIs gebraucht werden.
- Fuer Listen stabile Schluessel bevorzugen (keine Index-Keys, wenn vermeidbar).

## 4. Redux Toolkit
- Nur serialisierbare Daten im Store, ausser es gibt einen expliziten Ausnahmegrund.
- Reducer rein und deterministisch halten.
- Typed Hooks (`useAppDispatch`, `useAppSelector`) bevorzugen.
- Asynchrone Logik sauber kapseln (z. B. in Service/Firebase-Layer), nicht im UI verstreuen.

## 5. Firebase / Datenzugriff
- Datenzugriffe in `firebase/` zentralisieren; UI-Komponenten sollen keine Query-Details kennen.
- Fehler immer explizit behandeln (kein leeres `catch`).
- Bei Schreiboperationen klare Erfolgs-/Fehlerpfade definieren.
- Keine doppelten Queries in Render-Zyklen ausloesen.

## 6. Styling und UI
- Bestehende CSS-Module-Struktur beibehalten.
- Keine Inline-Styles fuer komplexe Layout-Logik, ausser fuer dynamische Kleinigkeiten.
- Auf mobile und desktop Layout achten.
- Alle Designs muessen responsiv umgesetzt werden; mobile hat Prioritaet, Tablet soll ebenfalls sauber unterstuetzt werden.
- Fuer Select-Eingaben soll projektweit das vorhandene CustomSelect verwendet werden.
- Dialog-Buttons sollen konsistent aussehen (gleiche visuelle Sprache, gleiche Hoehe/Padding/Abstaende fuer gleichartige Aktionen).
- Bei Submit/Cancel-Kombinationen muss der Submit-Button visuell klar hervorgehoben sein; beide Buttons muessen dennoch identische Hoehe haben.
- Dialog-Paddings sollen konsistent sein; vergleichbare Dialogtypen verwenden dieselben horizontalen/vertikalen Abstaende.
- Texte aus den vorhandenen Sprachdateien beziehen, nicht hart codieren.
- Kontrast und Lesbarkeit muessen in allen Zustaenden passen (normal, hover, focus, disabled, valid/invalid); helle Hintergruende brauchen dunkle Schrift und umgekehrt.
- Bei Overlays/Modals (z. B. "Daten hinzufuegen") muss die Lesbarkeit immer klar priorisiert werden: ausreichend abgedunkelter Hintergrund und ausreichend opake Foreground-Flaechen, damit Inhalte eindeutig erkennbar bleiben.

## 7. Benennung und Struktur
- Dateinamen und Exporte klar und konsistent benennen.
- Tippfehler in Namen vermeiden (z. B. `dimension` statt inkonsistenter Varianten).
- Eine Datei sollte ein klares Hauptthema haben.
- Keine toten Hilfsfunktionen oder alte Codepfade liegen lassen.

## 8. Fehlerbehandlung und Logging
- Fehler nicht verschlucken; aussagekraeftige Meldungen erzeugen.
- `console.log` nur fuer gezieltes Debugging und vor Merge entfernen.
- Nutzerkritische Fehlerpfade im UI sichtbar machen (z. B. Lade-/Fehlerzustand).

## 9. Tests und Verifikation
- Fuer neue Features, Bugfixes und Refactorings sollen passende Tests erstellt oder bestehende Tests erweitert werden.
- Bei Logik-Aenderungen mindestens die betroffenen Flows lokal pruefen.
- Vor Abschluss mindestens:
  - Type-Check/Lint erfolgreich
  - Relevante Build-/Run-Pfade getestet
  - Keine unbeabsichtigten Nebenwirkungen im Store/UI
- Wenn keine Tests vorhanden sind: manuelle Testschritte kurz dokumentieren.

## 10. Review-Checkliste vor Abschluss
- Vor jedem Commit ist eine kurze Selbst-Review verpflichtend (Diff, Risiken, Regressionen, offene Punkte).
- Ist die Loesung die einfachste robuste Variante?
- Sind Edge Cases und Fehlerpfade abgedeckt?
- Sind Effects/Async-Pfade stabil und ohne doppelte Aufrufe?
- Ist der Code fuer das Team sofort lesbar?
- Sind keine unnoetigen Abhaengigkeiten eingefuehrt worden?

## 11. Nicht tun
- Keine grossflaechigen Refactorings ohne Auftrag.
- Keine API-/Schema-Aenderungen ohne Abstimmung.
- Keine verdeckten Breaking Changes.
- Keine sicherheitsrelevanten Werte im Code oder in Logs hinterlegen.
