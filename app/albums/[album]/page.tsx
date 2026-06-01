import type { Metadata } from "next";
import ArtNavbar from "../../components/ArtNavbar";
import CustomCursor from "../../components/CustomCursor";
import Footer from "../../components/Footer";
import AlbumView from "../../components/AlbumView";
import styles from "../albums.module.css";

const ALBUMS_LIST_URL =
  "https://tasmia-portfolio.tasmia-art-gallery.workers.dev/albums";

// Static export: pre-render one page per album. Pulls the album list from the
// worker at build time. If the fetch fails, falls back to an empty list and the
// route stays client-rendered via the runtime fetch in AlbumView.
export async function generateStaticParams() {
  try {
    const res = await fetch(ALBUMS_LIST_URL);
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    const raw = Array.isArray(data)
      ? (data as { name?: string }[]).filter(
          (a) => a && typeof a.name === "string"
        )
      : [];
    // Return the RAW album name. Next.js URL-encodes the path segment itself
    // when writing the static file, so pre-encoding here would produce a file
    // literally named "Inktober%202025.html" (real % sign) that the decoded
    // request URL "/albums/Inktober%202025" can never match -> 404.
    return raw.map((a) => ({ album: a.name as string }));
  } catch {
    return [];
  }
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
