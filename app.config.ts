import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Static fields live in `app.json`. OAuth identifiers are read from the
 * environment so a public checkout does not ship a shared client or relay.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  extra: {
    ...config.extra,
    cloudflareOauth: {
      clientId: process.env.EXPO_PUBLIC_CF_OAUTH_CLIENT_ID?.trim() ?? '',
      redirectUri: process.env.EXPO_PUBLIC_CF_OAUTH_REDIRECT_URI?.trim() ?? '',
      scopes: [],
    },
  },
});
