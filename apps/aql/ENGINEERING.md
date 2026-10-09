# AQL Release Engineering Notes

This release publishes the supplied single-file AQL inspection app at `/apps/aql/` and keeps AQL storage, menus, and offline caching separate from PPM.

## Included

- AQL single HTML app from `VESA_Inspection_Quality_Suite_Fixed-1.html`.
- Sticky Home / File / Edit / View / Tools / Help menu overlay for AQL.
- Plain-language save/open/report labels.
- English, Bengali, Hindi, and Tamil guidance selector for explanatory menu guidance only.
- Practice example isolation: fictional examples are marked and opened without using an existing saved-record version.
- Guardrails for incomplete competency imports, master ID sanitisation, atomic master/sync imports, and selected stage-evidence contradictions.
- AQL service worker scoped to `/apps/aql/`.
- Root service worker exclusion for `/apps/aql/` and `/apps/ppm/`.

## Not Included

- Authenticated user roles, server collaboration, signed native Android/Windows packages, or live buyer/factory integrations.
- Real-factory pilot validation, buyer-approved sampling tables beyond the supplied app behavior, or legal compliance certification.
- Screenshot/GIF attachment evidence; those attachment paths were not supplied in this run.

## Verification Boundary

Automated checks use synthetic browser data. They do not certify real inspection findings or buyer acceptance.
