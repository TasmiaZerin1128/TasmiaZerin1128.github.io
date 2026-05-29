// Lists image filenames under the `portfolio/` prefix in the bound R2 bucket
// and returns them as a JSON array. Served at GET /portfolio.

export interface Env {
  BUCKET: R2Bucket;
}

const PREFIX = "portfolio/";
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/portfolio") {
      return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
    }

    const files: string[] = [];
    let cursor: string | undefined;
    do {
      const result = await env.BUCKET.list({ prefix: PREFIX, cursor });
      for (const obj of result.objects) {
        const name = obj.key.slice(PREFIX.length);
        if (name && IMAGE_EXT.test(name)) files.push(name);
      }
      cursor = result.truncated ? result.cursor : undefined;
    } while (cursor);

    files.sort();

    return new Response(JSON.stringify(files), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  },
};
