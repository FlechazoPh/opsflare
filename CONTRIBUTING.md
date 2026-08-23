# Contributing

## Setup

```sh
cp .env.example .env
npm install
```

OAuth env vars are optional for most work. API-token sign-in and the test
suite do not need them. To enable "Sign in with Cloudflare", deploy
`oauth-relay/` first, copy its `/callback` URL, register a Cloudflare OAuth
client with that URL, then put the client id and redirect URI in `.env`.
See [`oauth-relay/README.md`](oauth-relay/README.md).

## Checks

```sh
npm test -- --runInBand
npx tsc --noEmit
```

Add tests next to the code they cover (`__tests__/*.test.ts` or
`__tests__/*.test.tsx`). Keep UI copy in `src/i18n/locales/` and render it
through `t()` keys. Colors belong in `src/theme/tokens.ts`.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Pull requests

Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). Describe
what changed, how you tested it, and include screenshots for visual work.
Do not commit `.env`, `node_modules/`, `.expo/`, or generated `ios/` /
`android/` folders.
