import type { Metadata } from "next";
import ArtNavbar from "../../components/ArtNavbar";
import CustomCursor from "../../components/CustomCursor";
import Footer from "../../components/Footer";
import AlbumView from "../../components/AlbumView";
import styles from "../albums.module.css";
import albumsMetadata from "../../../public/albums-metadata.json";

const ALBUMS_LIST_URL =
  "https://tasmia-portfolio.tasmia-art-gallery.workers.dev/albums";

// Static export: pre-render one page per album. The committed metadata keys are
// the GUARANTEED base list — they're bundled, synchronous, and never fail. We
// only *augment* with the live worker list.
//
// Critical: never return an empty array. Under `output: export`, an empty param
// set means NO album matches, so every /albums/<name> request 500s with
// "missing param ... in generateStaticParams()". A flaky worker fetch must
// therefore only ever ADD albums, never wipe the list out.
export async function generateStaticParams() {
  // Guaranteed base: every album key committed in albums-metadata.json. This is
  // bundled and synchronous, so the list is complete and never empty.
  const names = new Set<string>(Object.keys(albumsMetadata));

  // Augment with the live worker list (the same source AlbumsGrid links to) so
  // albums in the bucket but not the metadata still get a page — but ONLY at
  // build time. In `next dev` the route is compiled on first request, and an
  // async network fetch here means the param set isn't ready in time, so that
  // first request 500s with "missing param ...". Keeping dev fully synchronous
  // (metadata only) avoids that race; the metadata already covers every album.
  if (process.env.NODE_ENV === "production") {
    try {
      const res = await fetch(ALBUMS_LIST_URL, {
        signal: AbortSignal.timeout(8000),
        
      });
      if (res.ok) {
        const data: unknown = await res.json();
        if (Array.isArray(data)) {
          for (const a of data as { name?: string }[]) {
            if (a && typeof a.name === "string") names.add(a.name);
          }
        }
      }
    } catch {
      // Worker unreachable at build time — keep the committed metadata albums.
    }
  }

  // Return the RAW album name only (NOT the full path). Next.js URL-encodes the
  // segment itself when writing the static file, so the value must be just
  // "Inktober 2020", never "/albums/[album]/Inktober 2020".
  return Array.from(names).map((album) => ({ album }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ album: string }>;
}): Promise<Metadata> {
  const { album } = await params;
  const name = decodeURIComponent(album);
  return {
    title: `${name} — Tasmia's Gallery`,
    description: `A gallery of works from ${name}.`,
  };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ album: string }>;
}) {
  const { album } = await params;
  const albumName = decodeURIComponent(album);

  return (
    <div className={`art-page ${styles.shell}`}>
      <CustomCursor />
      <div className={styles.bg} />
      <ArtNavbar />

      <main className={styles.wrap}>
        <AlbumView albumName={albumName} />
      </main>

      <Footer />
    </div>
  );
}
