# Google Photorealistic 3D Tiles — current state

The integration is written and compiles. It is **switched off** behind a `false`
flag in two places until the problem below is solved:

- `components/3d/FlightEnvironment.tsx` — the `<GoogleCity />` element
- `components/FlightHome.tsx` — the `<GoogleCityAttribution />` element

Turn both back on by replacing `{false ? … : null}` with the element.

## The problem

`3d-tiles-renderer`'s `GoogleCloudAuthPlugin` gets **HTTP 403** from
`https://tile.googleapis.com/v1/3dtiles/root.json`.

What has been ruled out:

| Check | Result |
|---|---|
| Key valid, Map Tiles API enabled, billing on | ✅ server-side request returns 200 |
| Referrer restriction blocking localhost | ✅ fixed — request with `Referer: http://localhost:3100/` returns 200 |
| Key reaching the client bundle | ✅ confirmed (attribution rendered, which is gated on it) |
| Same URL fetched from inside the page | ✅ **returns 200** |

So: a plain `fetch()` of the exact URL from the running page succeeds, while the
library's own request for the same URL fails with 403. The difference is in how
the plugin builds the request, not in the key or the Google project.

## Where to look next

1. Intercept `window.fetch` **before** the tiles renderer mounts (the plugin
   requests the root tileset from its constructor, not from the React effect),
   and log the exact URL, method and headers it sends. The earlier attempt
   installed the interceptor too late to catch it.
2. Check whether the installed plugin version authenticates with a
   `X-GOOG-API-KEY` header rather than `?key=`, and whether Google rejects
   header auth for browser-origin API keys.
3. Compare against the library's own Google tiles example for v0.5.3; the
   plugin options changed across releases (`apiToken` vs `apiKey`).
4. Consider the session flow: Photorealistic 3D Tiles issues a `session`
   parameter from the root tileset that every child tile request must carry.

## Known API differences in v0.5.3

Two were already fixed and are worth remembering:

- `errorThreshold` does not exist on `TilesRenderer`.
- `ellipsoid.getEastNorthUpFrame(lat, lon, height, target)` takes **four**
  arguments; an older signature took three.

## Update — narrowed further

The 403s in the console were **stale entries**, replayed from earlier page
loads. With a fetch interceptor installed at module load (so it catches the
renderer's very first request), a fresh page makes **zero** requests to
googleapis — nothing is being asked for at all.

So the problem is not authentication. `tiles.update()` is running from
`useFrame`, but the renderer never issues the root request. Next things to
check:

1. Whether `apiKey` is actually truthy inside `GoogleCity` — `.env.local` is
   loaded by Next and the var is `NEXT_PUBLIC_`, so it should be inlined, but
   this has not been proven at the component itself. Probe it directly.
2. Whether `tiles.group` ever gets added to the scene: the effect early-returns
   on `!group.current`, and if the component rendered `null` first (because
   `failed` latched true from an earlier error) the ref never attaches and the
   tileset is never parented.
3. `failed` latches permanently once set and never resets — a single transient
   error kills the city for the whole session. It should reset when the key or
   the component changes.
4. `setCamera()` is called every frame; confirm that is idempotent in v0.5.3
   rather than re-registering and resetting internal state each frame.
