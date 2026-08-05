---
name: IME-safe form inputs
description: Input handling for Persian keyboard, composition events, voice dictation, and decimal values
---

Controlled numeric inputs should keep a local text buffer and convert a normalized copy to a number for application state. Do not render the number state directly while the user is typing.

**Why:** Persian/Arabic digits, localized decimal separators, composition events, and intermediate values such as `1.` can be replaced or erased when every keystroke is immediately parsed and rendered back as a number.

**How to apply:** Use standard text inputs for editable numeric fields, normalize localized digits/separators at the boundary, preserve the raw normalized text locally, and let shared text inputs retain normal IME/voice-keyboard behavior.