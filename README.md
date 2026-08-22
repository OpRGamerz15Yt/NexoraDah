# NEXORA PRIME

Nexora Prime is a Discord management dashboard by Vynix Studio. This repository contains a GitHub Pages-compatible React client and a Node.js API service for Discord OAuth, server discovery, permission checks, and persistent guild settings.

The repository started without an existing bot or backend. Accordingly, the dashboard does not invent bot status, analytics, member counts, tickets, or moderation data. Those surfaces remain unavailable until a real Nexora bot API is connected. This is intentional: an unconfigured installation is clearly marked rather than presented as a demo.

## Architecture

```text
Browser -> GitHub Pages frontend -> Node API -> Discord OAuth/API
									  |          -> Nexora bot API (to be connected)
									  -> SQLite (guild settings)
```

The frontend never contains a bot token, OAuth client secret, database password, or session secret. The API checks Discord permissions server-side on every guild request.

## Requirements

- Node.js 22 or later
- An application in the [Discord Developer Portal](https://discord.com/developers/applications)
- A publicly reachable Node API for production OAuth callbacks
- A persistent filesystem or managed database for the API service

## Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:3001`. Without Discord credentials, the client intentionally shows the OAuth-not-configured state.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Long random value used to sign secure sessions |
| `PUBLIC_ORIGIN` | Browser origin to which OAuth redirects, such as `http://localhost:5173` |
| `DISCORD_CLIENT_ID` | Discord OAuth application client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth application secret; API only |
| `DISCORD_REDIRECT_URI` | Exact registered callback, normally `http://localhost:3001/api/auth/callback` |
| `DISCORD_BOT_TOKEN` | Optional API-only bot token for future bot health and guild operations |
| `DATABASE_PATH` | SQLite file location; use a persistent volume in production |
| `PORT` | API port, default `3001` |
| `OWNER_IDS` | Comma-separated Discord IDs for future owner-only routes |
| `VITE_BASE_PATH` | GitHub Pages base path, normally `/<repository-name>/` |
| `VITE_API_URL` | Public API origin used by a separately hosted backend, such as `https://api.example.com` |

Never commit `.env` or a database file. Rotate credentials if they are ever exposed.

## Discord OAuth setup

1. Create or open a Discord application.
2. Add the exact `DISCORD_REDIRECT_URI` under OAuth2 redirect URIs.
3. Enable the `identify` and `guilds` scopes used by the API.
4. Put the client ID and secret in the API environment only.
5. Install the Nexora bot separately in the servers it must manage. Bot permissions and role hierarchy still apply to Discord actions.

## GitHub Pages

The workflow at `.github/workflows/deploy.yml` runs tests, builds the Vite client, and deploys `dist` on pushes to `main`. In repository settings, set Pages > Build and deployment > Source to GitHub Actions. The workflow derives the repository name for `VITE_BASE_PATH`, so assets work on project pages.

GitHub Pages cannot run the API. Deploy `server/` to a Node-capable service, set `PUBLIC_ORIGIN` to the Pages URL, set the GitHub repository variable `VITE_API_URL` to the API origin, and register the API callback URL with Discord. A production reverse proxy or API domain is recommended when the client and API are on different origins; configure that deployment to allow credentials and use HTTPS.

## API contract

- `GET /api/session` returns authentication state and whether OAuth is configured.
- `GET /api/auth/login` starts Discord OAuth with a cryptographic state value.
- `GET /api/auth/callback` exchanges the code and establishes an HTTP-only session.
- `GET /api/auth/logout` destroys the session.
- `GET /api/servers` returns only servers returned by Discord where the user owns or can manage the server.
- `GET /api/guilds/:guildId/settings` reads persisted settings after a server-side permission check.
- `PUT /api/guilds/:guildId/settings` validates the JSON shape and persists settings after the same check.
- `GET /api/health` reports API health and whether Discord configuration exists.

The current bot repository and bot API were not present in the initial commit, so bot status, analytics, moderation actions, tickets, applications, AutoMod, AI, announcements, economy, leveling, and owner operations are not claimed as implemented. Connect those capabilities to authenticated API routes before exposing them in the dashboard.

## Testing and production checks

```bash
npm test
npm run build
npm start
```

The smoke test verifies the package/build contract. Before production, add integration tests against a Discord test application and a disposable database for OAuth, permissions, persistence failures, rate limits, and each bot capability as it is connected. Do not use fixture values in production-facing tests that could be mistaken for live dashboard data.

## Security notes

Sessions use HTTP-only, same-site cookies and OAuth state validation. API requests are rate-limited, input is size-limited, and guild authorization is repeated server-side. Use HTTPS in production, a strong `SESSION_SECRET`, a persistent database volume, restrictive CORS/reverse-proxy rules, and least-privilege Discord bot permissions. The in-process session store is suitable for local development only; use a shared session store before running multiple API instances.

## Support

Join the official Vynix Studio Discord: https://discord.gg/BH5TcybwG4