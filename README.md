# DJS Skylark website

The 2026 DJS Skylark website is a Next.js 16 application. The homepage contains the interactive aircraft, team story, results, and legacy photo/video gallery. The aircraft, engineering, team, and other pages are statically prerendered.

## Run locally

Use Node.js 20.9 or newer and npm. From the repository root:

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>. No database, account, or API key is required for the current homepage.

## Verify a release

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

After a successful build, `npm run start` serves the production build locally. The deployable assets are committed in `public/`, including the aircraft model, gallery media, and intro images. The original CAD and archive source folders stay local and are ignored by Git.

## Deploy

Connect this repository to a host that supports Next.js 16 (for example Vercel) and select the repository root as the project root. Use the default Next.js framework preset, `npm ci` for installation, and `npm run build` as the build command. The host can run `npm run start` when deploying as a Node.js server. Node.js 20.9 or newer is required.

The current site deploys without environment variables. Set `NEXT_PUBLIC_SITE_URL` to the final `https://` origin once the domain is connected so metadata uses the correct site URL. Do not set `NEXT_PUBLIC_GOOGLE_TILES_ENABLED` unless you intentionally enable the optional Map Tiles experience and have configured its billing and restrictions. The homepage currently uses local assets and does not request Google tiles.

Never commit `.env.local` or API keys. `NEXT_PUBLIC_` variables are embedded in browser code and are visible to visitors. See `.env.local.example` for the optional map settings.

## Edit the site

- `components/elevate/` contains the homepage sections, flight animation, gallery, and styles.
- `components/elevate/intro/RoverModel.jsx` controls the interactive aircraft. `LazyRover.jsx` loads its 3D code near the section, and `model-asset.json` points to the compressed, versioned asset in `public/models/`.
- `components/elevate/legacy-media.json` lists the media in `public/legacy/`.
- `app/` contains route pages and metadata.
- `data/` contains aircraft, results, and flight content.

The `Past Team Photos/` archive is a local source folder. To regenerate gallery copies after changing it, install Python's `opencv-python` and `Pillow` packages plus FFmpeg, then run `python scripts/build-legacy-media.py` followed by `python scripts/build-legacy-thumbnails.py`. The second command creates small WebP thumbnails and previews so the gallery never downloads full photos just to show a grid. Commit the updated `public/legacy/` files and `components/elevate/legacy-media.json`.

To replace the 3D model, put the source GLB outside `public/` and run `npm run optimize:model -- "path/to/source.glb"`. This simplifies and compresses the geometry, updates `components/elevate/model-asset.json`, and replaces the previous public model. Commit both the new model and manifest. The model URL includes a content hash, so browsers cache it for a year; the app warms its download when the browser is idle or the model section approaches. Gallery media is cached for a day. Videos download when opened in the viewer.
