---
name: Speech recognition sessions
description: Durable behavior needed for TraderMind voice typing across Chromium/Electron pauses.
---

Treat one user microphone click as one transcript session. Native recognition `onstart`/`onend` events can occur multiple times inside that session, especially after a pause, so only an explicit user stop may reset the input state.

**Why:** Chromium/Electron can stop and recreate its native speech-recognition instance after silence; treating that reconnect as a new session deletes or duplicates earlier words.

**How to apply:** Keep transcript buffers outside the native recognition instance, deduplicate final chunks, and invoke input `onStart`/`onEnd` only for explicit user actions. On Android native speech, `start()` resolves immediately when partial results are enabled; use `listeningState=stopped` as the utterance boundary.