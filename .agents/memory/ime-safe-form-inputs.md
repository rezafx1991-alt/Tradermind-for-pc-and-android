---
name: IME-safe form inputs
description: Input handling for Persian keyboard, composition events, voice dictation, and decimal values
---

Controlled numeric inputs should keep a local text buffer and convert a normalized copy to a number for application state. Do not render the number state directly while the user is typing.

**Why:** Persian/Arabic digits, localized decimal separators, composition events, and intermediate values such as `1.` can be replaced or erased when every keystroke is immediately parsed and rendered back as a number.

**How to apply:** Use standard text inputs for editable numeric fields, normalize localized digits/separators at the boundary, preserve the raw normalized text locally, and let shared text inputs retain normal IME/voice-keyboard behavior.

For Capacitor Android builds, keep `captureInput` disabled so the WebView uses Android's standard IME/InputConnection path.

**Why:** Capacitor's alternate captured-input path is a simpler keyboard implementation and can prevent Android keyboard voice dictation from reaching controlled React text fields.

**How to apply:** If Android voice typing stops working, verify the generated `android/app/src/main/assets/capacitor.config.json` contains `"captureInput": false` before changing application-level text fields.

Android WebView forms should also use resize-aware soft-input behavior, and app-lock visibility handlers must not lock while an input or textarea remains focused. Voice-typing UI can briefly affect WebView visibility without leaving the actual app.

**Why:** The keyboard dictation surface is a native overlay; treating its transient visibility change as an app background event can immediately dismiss the focused editor and cut off dictation.

**How to apply:** Keep `captureInput` disabled, set the Android activity to `adjustResize`, and use Capacitor app-state events for real background transitions while ignoring transient visibility changes during active text editing.