# VS Code Codex Prompt - Reconcile and Adopt VESA 360 Folder Tree

Copy the prompt below into Codex **after the current running checkpoint has been saved and verified**. This is a folder architecture and continuity instruction, not authorization for an uncontrolled rewrite or public deployment.

---

Read `VESA_360_RECOMMENDED_FOLDER_TREE.md`, repository-root `AGENTS.md`, `VESA_CONTINUITY_RULES.md`, `VESA_PROGRESS.md`, and the current application tracker under `docs/tna`, `docs/ppm`, or `docs/aql`. Then verify the actual local repository, branch, commit, `git status`, current files, and tests. The local workspace may be ahead of GitHub main.

1. Compare the existing local folder tree with the proposed tree. Label existing, missing-documentation, proposed-code, and conditional-backend paths. Never overwrite newer local instructions, trackers, or user changes; never discard uncommitted work.
2. Produce a file-level audit and architecture contract before any structure or code changes: ownership, dependencies, state/lifecycle, call paths, exact files to change, frozen files, verification, rollback and risks. Require an accepted checkpoint/scope before each patch group.
3. Use ONE extensible common VESA workspace UI implementation for Login/App Centre/TNA/PPM/AQL and any future app: same VESA branding and colors, one coherent sticky navigation region, the same HOME / FILE / EDIT / VIEW / TOOLS / HELP order, consistent save/open/report wording, mobile behavior, and four languages. Do not copy TNA calculation code into PPM/AQL or copy AQL Ac/Re/inspection logic into the other apps.
4. Preserve the existing PPM files and 168 checkpoint identities, existing AQL `index.html` and all sampling/acceptance rules, and current saved-copy formats until parity tests prove safe changes. AQL extraction is gradual, not a wholesale rewrite.
5. Reconcile all delivered MD specifications into `docs/{tna,ppm,aql}` plus root and scoped `AGENTS.md`. Do not import the PPM/AQL combined package twice. Keep `VESA_PROGRESS.md` as the one-click dashboard and update accurate verified gate percentages (not guesses) after each independently verified checkpoint.
6. Continue automatically to the next safe audited development checkpoint during this active Codex session. After each group test, record objective evidence, commit a reversible verified change and update the app tracker plus `VESA_PROGRESS.md` (overall, remaining, TNA, PPM, AQL, shared UI, active gate, last commit, blockers, one NEXT ACTION).
7. If an API provider, real server authentication, backend credentials, notification service, or staging account is missing, record EXTERNAL DEPENDENCY BLOCKED and work on other independent items; do not claim cloud collaboration live.
8. Future applications are expected; there is NO limit of three. Keep `js/app-catalogue.js`, shared shell, authentication adapter, theme/language contract and responsive navigation app-neutral and descriptor-driven. For each newly approved future app use `apps/<new-app-slug>/` with its own domain, storage, tests and `docs/<new-app-slug>/` tracker. Do not create placeholder app folders, silently publish app cards, or build unknown apps now. Future backlog must not alter current TNA/PPM/AQL progress percentages until a separately approved scope is baselined.
9. Never reset/clean the repository, silently rewrite buyer-approved rules, clear IndexedDB, push directly to public main or deploy to production without explicit authorization.

Start by reporting the local-vs-remote tree differences, then identify the single next safe action and execute that action with tests. Do not recreate completed work.


## Future-app continuity line (keep in the root architecture instructions)

> Treat VESA as an extensible application platform. TNA, PPM and AQL are only the first three active apps. New apps must plug into the SAME login/App Centre/branding/menu/language/mobile UX, while their calculations and stored records remain isolated. Never hardcode the app count to three. Do not invent or scaffold future apps until their individual requirements and release gates are approved.
