# tasmia-portfolio Worker

Tiny Cloudflare Worker that lists images in the `my-art-gallery` R2 bucket and
returns them as JSON. The site fetches from this Worker at runtime, so any new
file dropped into the bucket appears on the next page load — no redeploy
required.

Three routes:

- `GET /portfolio` — image filenames under the `portfolio/` prefix (the 3D
  gallery). Consumed by `PORTFOLIO_LIST_URL` in
  [`app/components/ArtGallery.tsx`](../app/components/ArtGallery.tsx).
- `GET /albums` — every *other* top-level folder treated as an album, each with
  its `name` and `cover` key (the `cover.*` file in the folder, else its first
  image). Consumed by `ALBUMS_LIST_URL` in
  [`app/components/AlbumsGrid.tsx`](../app/components/AlbumsGrid.tsx). Drop a new
  folder (e.g. `thailand/`) with a `cover.png` into the bucket and it shows up as
  an album automatically.
- `GET /albums/:name` — the images inside a single album folder, each
  `{ filename, url }`, naturally sorted by filename. Consumed by
  [`app/components/AlbumView.tsx`](../app/components/AlbumView.tsx). Any image
  dropped into the folder appears automatically; titles/descriptions are layered
  on from `public/albums-metadata.json` when present, otherwise the filename
  (without extension) is the title and the description is blank.

## One-time setup

```sh
cd worker
npx wrangler login   # opens browser, signs you in; npx fetches wrangler on demand
```

(If you'd rather have it installed globally: `npm install -g wrangler` once,
then drop the `npx` prefix everywhere below.)

## Deploy

```sh
cd worker
npx wrangler deploy
```

Wrangler will print the deployed URL, e.g.
`https://tasmia-portfolio.tasmia-art-gallery.workers.dev/`. Hit
`https://tasmia-portfolio.tasmia-art-gallery.workers.dev/portfolio` in a browser
and you should see a JSON array of filenames.

Paste that URL into `PORTFOLIO_LIST_URL` in
[`app/components/ArtGallery.tsx`](../app/components/ArtGallery.tsx).

## Local iteration

```sh
npx wrangler dev
```

Runs the Worker locally with the production R2 binding by default. Visit
`http://localhost:8787/portfolio` or `http://localhost:8787/albums`.
