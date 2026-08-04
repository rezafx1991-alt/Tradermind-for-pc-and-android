---
name: Release packaging
description: Environment constraint for producing TraderMind desktop and Android release files.
---

Windows installers require a Windows runner and Android APKs require the Android SDK, so release artifacts are produced by GitHub Actions rather than by the Linux workspace.

**Why:** The local workspace can validate TypeScript, the web bundle, Capacitor assets, and Electron compilation, but it cannot create a native Windows installer or run the Android Gradle build as reliably as the target runners.

**How to apply:** Use the repository workflow with a version tag to build and attach the Windows `.exe` and Android `.apk` to a GitHub Release.