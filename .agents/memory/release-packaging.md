---
name: Release packaging
description: Environment constraint for producing TraderMind desktop and Android release files.
---

Windows installers require a Windows runner and Android APKs require the Android SDK, so release artifacts are produced by GitHub Actions rather than by the Linux workspace.

**Why:** The local workspace can validate TypeScript, the web bundle, Capacitor assets, and Electron compilation, but it cannot create a native Windows installer or run the Android Gradle build as reliably as the target runners.

**How to apply:** Use the repository workflow with a version tag to build and attach the Windows `.exe` and Android `.apk` to a GitHub Release.

Windows NSIS upgrades must keep the existing `appId` and use a stable default installation path; allowing each installer run to choose a different path can make Windows treat the new version as a second installation.

**Why:** Earlier releases allowed changing the installation directory, which could cause the updater to report a conflicting/duplicate installation when the old version lived in another path.

**How to apply:** Keep the NSIS install directory fixed for future releases and do not change the app identifier.

Android projects are generated and ignored in the repository; versionCode/versionName and native compatibility patches must be applied by the release workflow after Capacitor sync.

**Why:** The Linux workspace's generated Android tree is not a source artifact, so committing native changes there does not reliably reach the GitHub APK build.

**How to apply:** Keep Android versioning and native patches in the tracked patch script, derive the version from the app package, and run it after `cap sync`.