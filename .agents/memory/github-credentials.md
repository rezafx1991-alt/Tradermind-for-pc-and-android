---
name: GitHub credentials
description: Safe authentication rule for repository operations.
---

GitHub operations must use the Replit-managed GitHub connection. Personal access tokens must not be requested in chat, written to files, or exposed in logs.

**Why:** The integration provides OAuth-based access without exposing a reusable credential to the project or conversation.

**How to apply:** If a push is rejected, report the repository/branch status and ask the user to authorize the GitHub connection or resolve branch protection in GitHub; do not work around it with a token or force push.