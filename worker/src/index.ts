// Cloudflare Worker for the art gallery R2 bucket.
//   GET /portfolio     -> JSON array of image filenames under the `portfolio/` prefix
//   GET /albums        -> JSON array of albums (every other top-level folder), each
//                         with its name and cover image key, e.g.
//                         [{ "name": "inktober25", "cover": "inktober25/cover.png" }]
//   GET /albums/:name  -> JSON array of the images inside that album folder, each
//                         { "filename": "day 1.png", "url": "<public base>/<key>" }
// The site prepends the public R2 base to the cover key to build the <img> src.

export interface Env {
  BUCKET: R2Bucket;
}

const PORTFOLIO_PREFIX = "portfolio/";
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
// A cover is the file literally named "cover" inside an album folder.
const COVER_RE = /^cover\.(png|jpe?g|webp|gif|avif)$/i;
// Public R2 base, used to build absolute image URLs in responses.
const PUBLIC_BASE = "https://pub-b82d94c1c7a147bfb13506d072e298b7.r2.dev";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });

// Lists every image filename under `portfolio/`.
async function listPortfolio(env: Env): Promise<string[]> {
  const files: string[] = [];
  let cursor: string | undefined;
  do {
    const result = await env.BUCKET.list({ prefix: PORTFOLIO_PREFIX, cursor });
    for (const obj of result.objects) {
      const name = obj.key.slice(PORTFOLIO_PREFIX.length);
      if (name && IMAGE_EXT.test(name)) files.push(name);
    }
    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);
  files.sort();
  return files;
}

interface Album {
  name: string;
  cover: string | null;
}

// Groups every object by its top-level folder, skips `portfolio/` and any loose
// root files, and picks each album's cover (the `cover.*` file, else the first
// image in the folder).
async function listAlbums(env: Env): Promise<Album[]> {
  const groups = new Map<string, { cover: string | null; first: string | null }>();
  let cursor: string | undefined;
  do {
    const result = await env.BUCKET.list({ cursor });
    for (const obj of result.objects) {
      const slash = obj.key.indexOf("/");
      if (slash === -1) continue; // loose root file
      const folder = obj.key.slice(0, slash);
      const filename = obj.key.slice(slash + 1);
      if (folder === "portfolio" || !filename) continue;
      if (!IMAGE_EXT.test(filename)) continue;

      const g = groups.get(folder) || { cover: null, first: null };
      if (g.first === null) g.first = obj.key;
      if (COVER_RE.test(filename)) g.cover = obj.key;
      groups.set(folder, g);
    }
    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);

  return Array.from(groups.entries())
    .map(([name, g]) => ({ name, cover: g.cover ?? g.first }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

interface AlbumImage {
  filename: string;
  url: string;
}

// Lists every image inside a single album folder, e.g. `Inktober 2025/`.
// Returns each image's filename and its absolute public URL.
async function listAlbumImages(env: Env, album: string): Promise<AlbumImage[]> {
  const prefix = `${album}/`;
  const images: AlbumImage[] = [];
  let cursor: string | undefined;
  do {
    const result = await env.BUCKET.list({ prefix, cursor });
    for (const obj of result.objects) {
      const filename = obj.key.slice(prefix.length);
      if (!filename || !IMAGE_EXT.test(filename)) continue;
      images.push({
        filename,
        url: `${PUBLIC_BASE}/${encodeURI(obj.key)}`,
      });
    }
    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);
  images.sort((a, b) =>
    a.filename.localeCompare(b.filename, undefined, { numeric: true })
  );
  return images;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const { pathname } = new URL(request.url);

    if (pathname === "/portfolio") {
      return json(await listPortfolio(env));
    }
    if (pathname === "/albums") {
      return json(await listAlbums(env));
    }
    // GET /albums/:name — images inside one album folder.
    if (pathname.startsWith("/albums/")) {
      const album = decodeURIComponent(pathname.slice("/albums/".length));
      if (album) return json(await listAlbumImages(env, album));
    }

    return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
  },
};
