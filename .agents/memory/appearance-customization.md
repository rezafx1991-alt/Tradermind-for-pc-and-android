---
name: Appearance customization
description: Appearance settings should stay local-first, support readable dark-mode contrast, and preserve automatic color defaults.
---

Appearance preferences are intentionally stored with the local app settings: font scale, accent palette, and optional text color. The automatic text color mode remains the safest default because it follows light/dark contrast, while custom colors are validated as six-digit hex values.

**Why:** TraderMind is offline-first and users reported dark-mode text becoming too dark; appearance needs to be configurable without a server or account.

**How to apply:** When adding new appearance controls, keep them in the settings store and ThemeProvider, validate persisted values for backward compatibility, and verify mobile layout plus dark-mode contrast.