---
name: Tagged releases
description: Release workflow behavior for TraderMind desktop and Android artifacts
---

Release automation must be triggered by pushing the intended `v*` tag. A manual workflow dispatch on `main` can successfully build artifacts but publishes them under a separate `main` release instead of the semantic version tag.

**Why:** The workflow uses `github.ref_name` for the release tag, so the dispatch ref directly determines the public release name and asset naming.

**How to apply:** Before publishing, ensure the tag points to the final commit and verify the GitHub Actions event is `push` with `head_branch` equal to that version tag. Prefer the version-tagged Release links over any accidental `main` release.