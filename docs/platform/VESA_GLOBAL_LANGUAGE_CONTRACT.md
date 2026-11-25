# VESA Global Language Contract — 2026-11-25

## One owner and five languages
- Single global locale owner: `js/preferences.js`, using browser-local `vesa.app.preferences.v1`.
- Supported locale values: `en` (English), `bn` (Bengali), `hi` (Hindi), `ta` (Tamil), `es` (Spanish).
- Login selection is retained across Login -> App Centre -> every application -> Admin and across browser reload.
- No app may silently reset a supported locale to English or introduce an independent language authority.
- Only Login may modify the global language choice. Shared Settings shows the selected language read-only and links to Login for changes; theme controls remain independent. Existing app-local language handlers must not override the Login selection. The canonical nested preference outranks legacy compatibility keys.
- Future apps must consume `VesaPrefs.read().language` and provide all five authored UI dictionaries, including source-driven reports.

## Translation boundaries
- Translate *presentation*: app navigation, headings, static labels, button/action text, field guidance, error/status messages and authored report headings.
- Never translate or change: style and PO IDs, user-entered text, buyer/company/factory names, source evidence, measurement values, currencies, formula input, domain enums, decision engine logic, checksums, save formats or approval results.
- Keep original domain state calculations and stored records bit-for-bit identical for any language.
- If a UI key has no vetted translation, fail coverage tests rather than silently claim complete support.
- No external requests with user data. Any source-language translation generation is build-time, from public static UI literals only, not from user records.

## Next app onboarding
1. Use `templates/vesa-next-app/` and one shared `VesaPrefs` instance.
2. Register EN/BN/HI/TA/ES labels, technical terminology rules, alerts, empty-state text and report chrome.
3. Verify every locale using Login -> App Centre -> app on mobile and desktop, including refresh and save/reopen.
4. The app must not enable in the catalogue until locale coverage and sibling-app regression tests pass.

## Scope freeze
No homepage, GIF/video, CSS/theme, app calculations, storage version, authentication model or existing user data changes are authorized by the global-language work.

## Current verification boundary
Shared platform text and language ownership are checked separately from app dictionaries. Full release still requires actual rendered labels, dialogs, report/print headings and app-local picker behavior in all five languages. Static key parity is not proof of complete visible translation.
