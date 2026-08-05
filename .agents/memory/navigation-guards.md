---
name: Navigation and exit guards
description: Cross-platform Back, close, and unsaved-change behavior for the offline desktop and Android app.
---

Android Back must navigate within the app whenever a prior route exists, use a page-parent fallback for direct deep links, and show exit confirmation only when Back is pressed on the dashboard. Desktop window close is a separate close action and always uses the app's exit confirmation, with unsaved forms first offering save, discard, or cancel.

**Why:** Browser history, Electron file-hash routing, and Capacitor Back events do not share identical navigation semantics; a single shared guard prevents platform-specific handlers from disagreeing.

**How to apply:** Register editable pages with the shared guard and keep native lifecycle handlers in the app shell. When adding a new deep-link page, add its parent fallback if direct-entry Back must return to a list page.