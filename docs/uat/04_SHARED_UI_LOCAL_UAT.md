# One VESA Shared UI Local UAT Checklist

Tester: __________  Date/time/timezone: __________  Browser/device: __________  Commit: __________

| ID | Human test steps | Expected result | Status | Evidence / notes |
|---|---|---|---|---|
| UAT-UI-01 | Open Login, authenticate, then view App Centre, TNA, PPM and AQL. | Login has one logged-out brand; every authenticated route has exactly one visible VESA logo/header/account/Settings/save owner. | NOT TESTED | |
| UAT-UI-02 | On each authenticated app inspect the command order. | Commands appear once and in order: Home / File / Edit / View / Tools / Help. | NOT TESTED | |
| UAT-UI-03 | Use Home/App Centre links and direct authenticated routes; log out and try a protected route. | Navigation preserves the intended route; logged-out protected access returns to Login with a same-origin return target. | NOT TESTED | |
| UAT-UI-04 | Change language and all available themes in Settings, then move among apps. | Preferences apply consistently; app records and user-entered values do not change. | NOT TESTED | |
| UAT-UI-05 | Review Login/App Centre/Admin/TNA/PPM/AQL at 390px, 768px and desktop. | No page-level horizontal overflow or clipped primary actions; mobile has one Menu owner. | NOT TESTED | |
| UAT-UI-06 | Set browser zoom to 200% and inspect key screens/dialogs. | Text and controls remain readable and operable; no duplicate navigation or hidden essential action appears. | NOT TESTED | |
| UAT-UI-07 | Use keyboard only from page load: skip link, menus, Settings, a dialog, Escape and return focus. | Focus order is logical and visible; skip link reaches current main content; Escape returns focus to the opener. | NOT TESTED | |
| UAT-UI-08 | Trigger unsaved, saving and saved states in each application. | Exactly one visible save message uses honest device-local wording and never implies cloud synchronization. | NOT TESTED | |
| UAT-UI-09 | Observe browser developer Network while using normal local flows. | No unexpected external application/data request occurs; records remain browser-local. | NOT TESTED | Record any font/browser request separately. |
| UAT-UI-10 | Review local login/help/backup wording with a nontechnical tester. | Wording does not claim secure tenant authentication, background notifications, remote collaboration or automatic backup. | NOT TESTED | |

Shared UI human verdict: `NOT TESTED` / `PASS` / `FAIL`  Tester signature: __________  Date: __________

