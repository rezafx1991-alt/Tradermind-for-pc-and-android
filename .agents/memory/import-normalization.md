---
name: Imported trade normalization
description: Imported trades need centralized, idempotent inference for session and lifecycle fields.
---

Imported trade normalization must distinguish a blank numeric value from numeric zero: zero P&L is a valid breakeven result and should close the trade when the source represents realized P&L. Session inference should use the active trading clock and fill only missing sessions during legacy repair.

**Why:** Broker reports commonly omit explicit status/session fields, while truthy parsing incorrectly treats zero as missing and leaves completed trades open.

**How to apply:** Keep import-time inference and startup repair on the same pure classifier; make repeated startup runs safe and do not overwrite a session selected manually by the user.