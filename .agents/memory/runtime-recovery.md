---
name: Runtime recovery
description: Durable guidance for offline PWA chunk failures and local Replay/Screenshot data resilience.
---

Offline desktop/mobile builds can fail at runtime even when bundling succeeds: a PWA may combine a fresh index with stale lazy chunks, and locally stored Replay data may contain malformed candle values or missing datasets.

**Why:** These failures surfaced only when opening lazy-loaded Screenshot Intelligence or Replay routes, so the generic application boundary hid the affected feature and made recovery unreliable.

**How to apply:** Use a bounded, one-shot cache/service-worker recovery for dynamic-import failures; keep Electron free of PWA registration; wrap data-heavy feature routes in dedicated boundaries; validate imported/local OHLC data before chart math and catch FileReader/IndexedDB async failures at the feature boundary.