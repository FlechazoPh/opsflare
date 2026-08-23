# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for a security problem.

Use GitHub's private vulnerability reporting:

https://github.com/bearBoy80/opsflare/security/advisories/new

Include the affected version or commit, what you expected, and what you
observed.

We will acknowledge the report and work on a fix before any public
disclosure.

## What this app stores

- Local unlock password: salted hash in `expo-secure-store` only.
- Cloudflare API tokens and OAuth tokens: `expo-secure-store` only.
- The optional `oauth-relay` Worker forwards `code` and `state`. It never
  sees access tokens, refresh tokens, or the PKCE verifier.

Do not commit `.env`, signing certificates, provisioning profiles, or
real Cloudflare credentials.
