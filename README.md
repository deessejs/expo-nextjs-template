# Expo + Next.js starter

A pnpm/Turborepo monorepo with an Expo Router app for Android and iOS and a separate Next.js dashboard. Both clients use one Better Auth server, PostgreSQL/Drizzle, and a shared Hono + oRPC API mounted by Next.js at `/api`. There is no separately deployed API service.

## Requirements

- Node.js 24 (or Node.js 22.13+ and below 27)
- pnpm 12.16.1
- PostgreSQL 15+
- Android Studio/SDK for native Android builds; Xcode on macOS for iOS builds

## Local setup

Create a database, for example with local PostgreSQL:

```sh
createdb expo_nextjs
cp .env.example .env
```

Before starting commands in each terminal, export the shared root environment so Next.js and Expo both receive it:

```sh
set -a
. ./.env
set +a
```

Set `DATABASE_URL` to that database and replace `BETTER_AUTH_SECRET` with a unique random value (for example `openssl rand -base64 32`). The auth server fails at startup if the secret is missing; the example value is only a placeholder. Never use the CI-only build secret in a deployed environment. `BETTER_AUTH_URL` is the Next origin. For a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN address (such as `http://192.168.1.10:3000`), not `localhost`. Keep the phone and computer on a reachable network and allow the port through the computer firewall.

Install and prepare the database:

```sh
pnpm install
pnpm db:generate
pnpm db:migrate
```

The generated Drizzle migration initializes Better Auth tables and the user-owned notes table. Use `pnpm db:push` only for disposable local databases. To reset local data, drop/recreate `expo_nextjs` and rerun migrations.

## Run the apps

```sh
pnpm --filter @deessejs/web dev       # http://localhost:3000 (includes /api/auth and /api/rpc)
pnpm --filter @deessejs/mobile start # Expo dev server
```

Or run both with `pnpm dev`. On a phone, scan the Expo QR code using a development build. The native auth client persists session cookies with `expo-secure-store`; browser auth uses HTTP-only cookies. Create an account on either client, sign in on the other, and add/delete notes to see the same account-scoped data. API handlers derive the user from the verified Better Auth session and apply the owner ID on every note query/mutation.

Android/iOS development builds use Expo Continuous Native Generation. Use `pnpm --filter @deessejs/mobile android` or `ios` after installing native tooling. Expo Go is suitable for quick UI iteration; use a development build for secure-store/deep-link/device validation.

## Checks and builds

```sh
pnpm lint
pnpm format:check
pnpm typecheck
pnpm check:expo
pnpm --filter @deessejs/web build
pnpm --filter @deessejs/mobile exec expo export --platform android
```

GitHub Actions runs these as independent jobs: lint, format, typecheck, Expo Doctor, web production build, and Android JavaScript export. Formatting can be applied with `pnpm format`.

## Preview APK artifact

Run **Actions → Android preview APK → Run workflow**. Repository secrets required:

- `EXPO_TOKEN`: Expo access token used to resolve the configured EAS project for local build tooling.
- `EXPO_PROJECT_ID`: UUID of the Expo project. Create/link the project once with `pnpm dlx eas-cli@27.11.0 init` from `apps/mobile` and set the resulting ID here.
- `EXPO_PUBLIC_API_URL` repository variable: the reachable origin of the deployed Next.js app (for example `https://starter.example.com`). The APK embeds this public URL so a physical device can reach `/api/auth` and `/api/rpc`; it is not a secret.

The workflow compiles using `eas build --local` on GitHub's Linux runner and uploads `android-preview-apk`. It does not run a cloud EAS build or submit to a store. Download the artifact from the completed Actions run, unzip it, and install the APK on an Android device (allow installation from that source). GitHub runner minutes and artifact retention policies apply. Repeat installs need the same signing key; configure EAS Android credentials for a stable internal key if you need upgrade-in-place between APKs. No signing secrets are committed.

## Architecture

- `apps/mobile`: Expo Router, NativeWind, lucide-react-native, Expo SecureStore.
- `apps/web`: Next.js 16, Tailwind CSS v4, shadcn-configured web primitives, and lucide-react.
- `packages/auth`: the single Better Auth configuration (email/password and Expo server plugin).
- `packages/database`: Drizzle schema and PostgreSQL connection/migrations.
- `packages/api`: reusable Hono and oRPC procedures. Next.js catch-all route hosts it.

Never expose database credentials or Better Auth secrets through `EXPO_PUBLIC_*` variables. Configure deployed `BETTER_AUTH_URL`, trusted origins and the client API URL for your eventual host before production use.
