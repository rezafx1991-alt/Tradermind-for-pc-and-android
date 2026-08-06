---
name: Dependency security
description: Security decisions for desktop runtime and trade export dependencies.
---

The trade export flow does not need to create native XLSX workbooks; a UTF-8 BOM-marked CSV opens correctly in Excel and Google Sheets while avoiding the vulnerable legacy `xlsx` package. Electron is a runtime dependency for the Windows installer and should stay on a security-fixed major line.

**Why:** The dependency scanner reported high advisories for `xlsx` and the older Electron line, while SAST and privacy scans were clean. Replacing the export dependency reduced attack surface without changing backup/restore behavior.

**How to apply:** Do not reintroduce `xlsx` just to preserve the `.xlsx` extension. If native XLSX output becomes a hard requirement, evaluate a maintained writer separately and re-run the full dependency audit, desktop build, and export tests.