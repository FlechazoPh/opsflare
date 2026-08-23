# opsflare-oauth-relay

Cloudflare Worker that relays the Cloudflare OAuth authorization response into
Opsflare. **Deploy this Worker before you turn on "Sign in with Cloudflare".**
The app cannot complete OAuth until you have:

1. This Worker's public `https` URL
2. A Cloudflare OAuth client whose redirect URI is that URL plus `/callback`

Cloudflare rejects private-use redirect URIs (`opsflare://…`), so the OAuth
client is registered with this Worker's `https` URL. The Worker 302s the
authorization response to `opsflare://oauth/callback`.

The Worker is stateless and holds no secrets: the PKCE verifier stays on the
device and the token exchange happens directly between the app and
`https://dash.cloudflare.com/oauth2/token`.

## 1. Deploy and copy the URL

```sh
cd oauth-relay
npm install
npx wrangler login
npm run deploy
```

Wrangler prints a public origin, for example:

```
https://opsflare-oauth-relay.<subdomain>.workers.dev
```

The value you will register and put in `.env` is that origin plus `/callback`:

```
https://opsflare-oauth-relay.<subdomain>.workers.dev/callback
```

Keep the path. Cloudflare compares redirect URIs byte for byte.

## 2. Create the Cloudflare OAuth client

In the [Cloudflare dashboard](https://dash.cloudflare.com/):

1. Select the account that should own the client.
2. Go to **Manage account → OAuth clients**.
3. Select **Create client**.
4. Use settings that match a public native app with PKCE:

   | Field | Value |
   | --- | --- |
   | Client name | `Opsflare` (or your fork name) |
   | Response type | `code` |
   | Grant types | `authorization_code` and `refresh_token` |
   | Token authentication method | `none` (public client; no secret in the app) |
   | Redirect URL | the `/callback` URL from step 1 |

5. Add the scopes the app requests (see below). Cloudflare only allows the
   client to ask for scopes you register here.
6. Create the client and copy the **Client ID**. The app does not use a
   client secret.

Official docs:
https://developers.cloudflare.com/fundamentals/oauth/create-an-oauth-client/

### Scopes the app asks for

Register at least these, plus `offline_access` if the dashboard does not add
it automatically when you enable the refresh-token grant:

```
account-settings.read
zone.read
zone.write
zone-settings.read
zone-settings.write
ssl-and-certificates.read
cache.purge
dns.read
dns.write
firewall-services.read
workers-r2.read
workers-r2.write
workers-kv-storage.read
workers-kv-storage.write
d1.read
d1.write
workers-scripts.read
workers-scripts.write
workers-routes.read
workers-routes.write
page.read
page.write
analytics.read
account-analytics.read
load-balancers.read
load-balancing-monitors-and-pools.read
notifications.read
offline_access
```

Billing is not available as an OAuth scope. Subscriptions still need an API
token with Account · Billing · Read.

## 3. Point the app at both values

In the app checkout:

```sh
cp .env.example .env
```

Then set:

```
EXPO_PUBLIC_CF_OAUTH_CLIENT_ID=<client id from step 2>
EXPO_PUBLIC_CF_OAUTH_REDIRECT_URI=https://opsflare-oauth-relay.<subdomain>.workers.dev/callback
```

`EXPO_PUBLIC_CF_OAUTH_REDIRECT_URI` must be identical to the dashboard
redirect URL. Restart Metro after editing `.env`.

Leave both empty to hide "Sign in with Cloudflare". API-token sign-in does
not need this Worker.

## Local development

```sh
npm run dev
curl -i "http://localhost:8787/callback?code=abc&state=xyz"
```

The response should be a `302` with
`Location: opsflare://oauth/callback?code=abc&state=xyz`. A request with no
`code` and no `error` is rewritten to `error=invalid_response` so the app can
tell a malformed response apart from a cancelled sign-in.

`wrangler dev` is for testing the 302 only. Cloudflare will not send a real
authorization response to `http://localhost`, so a full OAuth sign-in still
needs the deployed Worker URL from step 1.

To point the relay at another scheme (a dev client, say), change
`vars.APP_CALLBACK` in `wrangler.jsonc` or override it per environment.

## Behaviour

| Request                       | Response                                            |
| ----------------------------- | --------------------------------------------------- |
| `GET /callback?code&state`    | `302` to the app scheme with the response parameters |
| `GET /callback?error=...`     | `302` to the app scheme with the error parameters    |
| `GET /callback` (no params)   | `302` with `error=invalid_response`                  |
| Any other path                | `404`                                                |
| Non-`GET`/`HEAD` on `/callback` | `405`                                              |

Only `code`, `state`, `scope`, `error`, `error_description` and `error_uri` are
forwarded; other query parameters are dropped.
