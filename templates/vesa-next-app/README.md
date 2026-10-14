# VESA next-app starter

This source-only starter prepares a future browser-local VESA workspace without registering or publishing an app. Copy it into `apps/<approved-slug>/` only after the app name, purpose and domain rules are supplied.

## Fixed platform boundary

- Reuse `js/vesa-workspace-shell.js` and `css/vesa-workspace.css`; render no second logo, header, account area, Settings control or universal menu.
- Register one catalogue descriptor in `js/app-catalogue.js` and add its open-label key in all four `js/preferences.js` dictionaries.
- Keep domain calculations in independent pure modules. The starter deliberately contains no business formula, approval, release rule or cross-app inference.
- Store records under an app-specific browser key. Provide explicit Download Saved Copy and Open Saved Copy commands; never upload records or tokens.
- Treat the browser login as a local convenience, not authentication. Use synthetic data in tests and never commit buyer, employee or production records.
- Reports must be escaped, printable, mobile-readable and explicit about draft/approval boundaries.

## Copy checklist

1. Replace every `next-app` / `Next VESA App` placeholder in the examples.
2. Define a versioned immutable record schema and pure domain engine before building screens.
3. Adapt `workspace-adapter.example.js` to the approved domain callbacks.
4. Implement bounded import validation before enabling saved-copy restore.
5. Add the catalogue entry and four language labels only when the route exists.
6. Add an app service worker only if its scope and update/recovery behavior are independently tested.
7. Run the checklist in `ACCEPTANCE.md`, focused app tests, adjacent shared-shell tests and the complete cross-app suite at the acceptance boundary.

This folder is not a live route and is intentionally absent from the App Centre.
