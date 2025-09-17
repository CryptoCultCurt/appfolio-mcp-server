# OAuth Refresh Token Configuration

## Environment Variables for Refresh Token Support

Add these to your `.env` file or environment:

```bash
# OAuth Scopes (CRITICAL: include offline_access for refresh tokens)
OAUTH_SCOPES_SUPPORTED="read:user write:user offline_access"

# Existing OAuth config...
OAUTH_JWKS_URL=https://cool-autumn-11-staging.authkit.app/oauth2/jwks
OAUTH_ISSUER=https://cool-autumn-11-staging.authkit.app
OAUTH_AUDIENCE=your-api-identifier
OAUTH_PROXY_AUTHORIZATION_URL=https://cool-autumn-11-staging.authkit.app/oauth2/authorize
OAUTH_PROXY_TOKEN_URL=https://cool-autumn-11-staging.authkit.app/oauth2/token
OAUTH_PROXY_REVOCATION_URL=https://cool-autumn-11-staging.authkit.app/oauth2/revoke
OAUTH_PROXY_REGISTRATION_URL=https://cool-autumn-11-staging.authkit.app/oauth2/register
```

## AuthKit Dashboard Configuration

1. **Enable Refresh Tokens:**
   - Go to your AuthKit application settings
   - Enable "Offline Access" or "Refresh Token" support
   - Set appropriate token lifetimes:
     - Access Token: 1 hour (3600 seconds)
     - Refresh Token: 30 days (2592000 seconds)

2. **Update Application Scopes:**
   - Add `offline_access` to your application's allowed scopes
   - Ensure `read:user` and `write:user` are also included

3. **Client Configuration:**
   - Ensure your application is configured as a "Web Application" or "Single Page Application"
   - Enable "Authorization Code" grant type
   - Enable "Refresh Token" grant type

## Testing Refresh Token Flow

After configuration, test with curl:

```bash
# 1. Get authorization code (browser redirect)
curl "https://cool-autumn-11-staging.authkit.app/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=read:user write:user offline_access"

# 2. Exchange code for tokens (should include refresh_token)
curl -X POST https://cool-autumn-11-staging.authkit.app/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=YOUR_CODE&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&redirect_uri=YOUR_REDIRECT_URI"

# 3. Response should include:
# {
#   "access_token": "...",
#   "refresh_token": "...",  <- This should be present
#   "token_type": "Bearer",
#   "expires_in": 3600
# }
```

## Tasklet Integration

Once refresh tokens are enabled, Tasklet will be able to:
1. Receive both access and refresh tokens during initial OAuth flow
2. Automatically refresh expired access tokens using the refresh token
3. Maintain long-running authentication without user intervention
