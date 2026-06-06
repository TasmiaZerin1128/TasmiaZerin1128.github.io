import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only emit a static export for production builds (`next build`). In dev,
  // `output: "export"` makes the dev server enforce the static-export param
  // check on every request; the first hit to a dynamic route (e.g.
  // /albums/<name>) races the on-demand route compilation and 500s with
  // "missing param ... in generateStaticParams()". Leaving `output` undefined
  // in dev lets the album route render dynamically, so `npm run dev` just works.
  // `next build` still produces the static `out/` for deployment.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
