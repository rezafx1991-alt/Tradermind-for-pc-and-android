---
name: RTL name display
description: Display rule for Persian account, broker, and other user-defined names.
---

Persian user-defined names should be rendered right-to-left with wrapping enabled. Avoid one-line truncation and ellipsis for these values because RTL layout can visually hide the final characters and make a complete stored name appear truncated.

**Why:** Short Persian names and the last word of multi-word names appeared to lose their final characters in account views even though the stored value was intact.

**How to apply:** Use explicit RTL direction, normal whitespace, and word breaking in account/broker selectors, cards, dashboards, and other user-defined name displays.