# tasmia-portfolio Worker

Tiny Cloudflare Worker that lists the image files in the `portfolio/` prefix of
the `my-art-gallery` R2 bucket and returns them as JSON. The portfolio gallery
on the site fetches `GET /portfolio` from this Worker at runtime, so any new
file dropped into the bucket appears in the gallery on the next page load — no
redeploy required.

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
`https://tasmia-portfolio.<your-subdomain>.workers.dev`. Hit
`https://tasmia-portfolio.<your-subdomain>.workers.dev/portfolio` in a browser
and you should see a JSON array of filenames.

Paste that URL into `PORTFOLIO_LIST_URL` in
[`app/components/ArtGallery.tsx`](../app/components/ArtGallery.tsx).

## Local iteration

```sh
npx wrangler dev
```

Runs the Worker locally with the production R2 binding by default. Visit
`http://localhost:8787/portfolio`.
