# AGENTS.md

Diese Datei definiert verbindliche Arbeitsregeln fuer dieses Repository.
Ziel: konsistenter Code-Style, robuste Implementierungen und wenig Regressionen.

## 1. Grundprinzipien

- Bevorzuge kleine, klar getrennte Aenderungen pro Thema.
- Korrigiere Ursachen, nicht nur Symptome.
- Keine stillen "quick fixes", die technische Schulden erhoehen.
- Halte Verhalten stabil, ausser eine Verhaltensaenderung ist explizit gewuenscht.
- Neue Branches immer von `master` ableiten.
- Nutze Serena (MCP) so oft wie moeglich fuer Analyse, Navigation und Code-Aenderungen im Projekt.
- Bewerte Architektur, Lesbarkeit, Wartbarkeit und Risikomanagement konsequent aus Senior-Developer-Sicht.
- Wende SOLID- und DRY-Prinzipien konsequent an.
- Bevorzuge eine klare, gut erweiterbare Architektur mit sauber getrennten Verantwortlichkeiten.
- Git-Workflow: `git fetch`, `git pull` und `git commit` duerfen immer ohne Rueckfrage ausgefuehrt werden (auch wenn im Chat nicht explizit zum Commit aufgefordert wurde). `git push` darf ebenfalls ohne Rueckfrage ausgefuehrt werden, ausser auf den Branches `master` und `production` (dort nur mit expliziter User-Anweisung).
- Vor neuen Feature-Vorschlaegen zuerst Cleanup-Tasks priorisieren und aktiv vorschlagen.
- Feature-Vorschlaege erst nach erledigtem oder bewusst dokumentiert zurueckgestelltem Cleanup machen.

## 2. TypeScript-Standards

- `strict` bleibt aktiv; keine Aufweichung in `tsconfig.json`.
- Keine neuen `any`-Typen. Falls unvermeidbar: lokal kapseln und begruenden.
- Nutze konkrete Rueckgabetypen fuer exportierte Funktionen.
- Bevorzuge `type`/`interface` statt impliziter Objektformen in komplexen Datenstrukturen.
- Keine ungenutzten Variablen, Imports oder Typen einchecken.
- Keine Magic Numbers: numerische oder zeitbasierte Fachwerte immer als benannte `const` mit sprechendem Namen auslagern.
- Konstanten (`const`) nicht inline in Feature-/Logic-Dateien definieren, wenn sie wiederverwendbar oder fachlich relevant sind; stattdessen in separaten Constant-Dateien mit klarer Ordnerstruktur ablegen (z. B. `constants/`, `utils/<domain>/constants/`).
- Keine ungueltigen `as const` Assertions auf nicht-literalen Ausdruecken verwenden; stattdessen Zieltypen explizit annotieren.
- In Test-Hilfstypen fuer Component-Props keine `{}`-Funktionsplatzhalter verwenden; Callback-Props immer als aufrufbare Signatur typisieren (z. B. `(...args: unknown[]) => void`).
- Fuer neue und bearbeitete Funktionen sind englische Docstrings (`/** ... */`) verpflichtend.
- Jeder Docstring muss englische `@param`-Eintraege (falls Parameter vorhanden) und einen englischen `@returns`-Eintrag (falls Rueckgabewert vorhanden) enthalten.
- Die Einhaltung wird ueber Linting (`npm run lint:docstrings`) geprueft.

## 3. React / Next.js

- Komponenten als kleine, fokussierte Einheiten bauen.
- `useEffect` immer mit korrekter Dependency-Liste; keine unbeabsichtigten Endlosschleifen.
- Keine Side-Effects waehrend Render.
- Props und State minimal halten; abgeleitete Werte per `useMemo` nur wenn noetig.
- Bei Client Components nur dann `'use client'`, wenn Hooks/Browser-APIs gebraucht werden.
- Fuer Listen stabile Schluessel bevorzugen (keine Index-Keys, wenn vermeidbar).
- Next.js `metadata` Exporte in `app/*/layout.tsx` und `app/*/page.tsx` immer explizit als `Metadata` aus `next` typisieren.

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
- Vor CSS-Aenderungen immer zuerst die existierenden globalen CSS-Variablen pruefen und ausschliesslich definierte Tokens verwenden (z. B. Highlight-Farbe `--primary-color`, nicht neue/undefinierte Varianten wie `--accent-color`).

## 7. Benennung und Struktur

- Dateinamen und Exporte klar und konsistent benennen.
- Tippfehler in Namen vermeiden (z. B. `dimension` statt inkonsistenter Varianten).
- Eine Datei sollte ein klares Hauptthema haben.
- Keine toten Hilfsfunktionen oder alte Codepfade liegen lassen.
- Sprache: Code, Dateinamen, Bezeichner, Kommentare, Commit-Messages und technische Dokumentation standardmaessig in Englisch verfassen.
- Ausnahme: Inhalte von Umsetzungs-/Roadmap-Planungsdokumenten duerfen auf Deutsch bleiben.
- Neue Features und neue Komponenten direkt in Feature-/Co-Location-Struktur anlegen (`<Feature>.tsx`, `<Feature>.module.css`, `<Feature>.spec.ts(x)` im selben Feature-Ordner).
- Feature-Komponenten unter `components/features/<Bereich>/<Feature>/` gruppieren (z. B. `components/features/home/Login/`), damit zusammengehoerige Komponenten klar gebuendelt sind.
- Wiederverwendbare, bereichsuebergreifende UI-Bausteine unter `components/shared/<Kategorie>/<Feature>/` gruppieren (z. B. `components/shared/ui/CustomButton/`).
- Feature-nahe Logik im jeweiligen Feature-Ordner halten (z. B. `<Feature>.logic.ts`); `domain/` nur fuer geteilte, UI-unabhaengige Fachlogik verwenden.
- Umstrukturierungen von Komponenten in Richtung Feature-/Co-Location-Struktur im File `RESTRUCTURING_STATUS.md` dokumentieren und nach jedem einzelnen Schritt aktualisieren.
- Vor dem Anlegen neuer Komponenten/Dateien immer aktiv den besten Zielort in der Projektstruktur pruefen; bei Unsicherheit vorab im Chat nachfragen.
- Wenn bestehende Ordner-/Dateistrukturen nicht den Zielstandards entsprechen, neue Komponenten/Dateien trotzdem direkt in der besseren Zielstruktur anlegen (keine Fortfuehrung veralteter Strukturmuster).
- Konstanten nach Nutzungskontext platzieren: lokal im Feature/Modul, wenn nur dort genutzt; domain-spezifisch unter `utils/<domain>/constants/`, wenn mehrere Dateien derselben Domain sie teilen.
- Globale `constants/` nur fuer wirklich app-weite Werte verwenden; keine pauschale Ablage aller Konstanten im globalen Ordner.
- Konstanten thematisch trennen (z. B. `errorCodes.ts`, `sessionConfig.ts`, `eventNames.ts`) statt grosse Sammeldateien (`constants.ts`) aufzubauen.
- Keine \"God constants file\": mehrere kleine, fokussierte Constant-Dateien bevorzugen.

## 8. Fehlerbehandlung und Logging

- Fehler nicht verschlucken; aussagekraeftige Meldungen erzeugen.
- `console.log` nur fuer gezieltes Debugging und vor Merge entfernen.
- Nutzerkritische Fehlerpfade im UI sichtbar machen (z. B. Lade-/Fehlerzustand).
- Error-Codes niemals als harte String-Literale streuen: immer zentral ueber benannte `const` referenzieren.
- Error-Code-Namen muessen im UPPER_SNAKE_CASE-Schema vorliegen, z. B. `THIS_IS_A_ERRORCODE`.
- Error-Codes konsistent strukturieren: entweder als `*_ERROR_CODE`-Konstanten oder gebuendelt in einem `ERROR_CODES`-Objekt mit `as const` und abgeleiteten Union-Typen.
- Error-Code-Konstanten muessen im UPPER_SNAKE_CASE-Schema mit Suffix `_ERROR_CODE` benannt werden (z. B. `SESSION_VALIDATION_UNAVAILABLE_ERROR_CODE`), waehrend der zugehoerige String-Wert in `snake_case` bleibt (z. B. `"session_validation_unavailable"`).

## 9. Tests und Verifikation

- Fuer neue Features, Bugfixes und Refactorings sollen passende Tests erstellt oder bestehende Tests erweitert werden.
- Bei Logik-Aenderungen mindestens die betroffenen Flows lokal pruefen.
- Bevorzuge in Component-Tests reale Render-/Interaction-Tests (echte User-Pfade) statt starkem Hook-Mocking; Hook-Mocking nur gezielt und minimal einsetzen, wenn ein Flow anders nicht sinnvoll testbar ist.
- Vor Abschluss mindestens:
  - Type-Check/Lint erfolgreich
  - `npx tsc --noEmit` erfolgreich (keine TS-Fehler in App, Komponenten und Tests)
  - `npm run lint` erfolgreich
  - `npm run lint:docstrings` erfolgreich
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
