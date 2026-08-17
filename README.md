# Affidavit UI

Angular 8 SPA for Afrilight / NOTAGO. The app contains public user flows,
admin operations, and court/registrar workspaces in one frontend.

## Toolchain

Use the frontend toolchain documented in `../afrilight-affidavit-server/docs/guides/PROJECT_BUILD_GUIDE.md`:

- Node.js 12.22.12
- npm 6.14.x

Newer Node versions can fail Angular 8 production builds with misleading
callback/build errors.

## Environment Configuration

The app uses Angular environment files.

For local development, create `src/environments/environment.local.ts`:

```bash
cp src/environments/environment.local.example.ts src/environments/environment.local.ts
```

Set at least:

- `url`: backend base URL with a trailing slash
- `publicKey`: Flutterwave public key for payment UI paths, when needed

`npm start` serves with the local configuration:

```bash
npm start
```

Under the hood this uses:

```bash
ng serve --configuration=local
```

## Cloudflare Pages

Cloudflare Pages should use:

```bash
npm run build:cloudflare
```

Cloudflare environment variables are available only during the build step. The
build command generates `src/environments/environment.cloudflare.ts` and then
runs the Angular build. The generated file is ignored by git.

Required Cloudflare variables:

- `API_URL`

Optional Cloudflare variables:

- `PRODUCTION`
- `FLUTTERWAVE_PUBLIC_KEY`

`API_URL` is normalized with a trailing slash because the app builds API URLs by
concatenating `environment.url` with endpoint paths.

Production builds can also be run with:

```bash
npm run build:prod
```

`build:prod` is an alias for the Cloudflare build path.

## Dependency Note

`file-saver` is intentionally listed as a direct dependency. The `jspdf@1.5.3`
dependency metadata can otherwise make npm 6 resolve an invalid
`file-saver@1.3.8` tag during install.

## Documentation

Canonical project documentation lives under `../afrilight-affidavit-server/docs/`.
Start with `../afrilight-affidavit-server/docs/index.md` for the current
documentation map.

Useful UI references:

- `../afrilight-affidavit-server/docs/guides/development-guide-ui.md`
- `../afrilight-affidavit-server/docs/architecture/architecture-ui.md`
- `../afrilight-affidavit-server/docs/reference/component-inventory-ui.md`
- `../afrilight-affidavit-server/docs/guides/PROJECT_BUILD_GUIDE.md`

## Current Integration Surface

- Backend REST API through `environment.url`
- Flutterwave public key for payment UI integration
- Documenso embedded signing components served by backend signing endpoints
- Calendly widget script loaded from `src/index.html`

The old profile image upload UI has been removed; the frontend no longer needs
S3 configuration.
