"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./AlbumsGrid.module.css";
import head from "../albums/albums.module.css";

function AlbumsHeader() {
  return (
    <header className={head.head}>
      <div className={head.watermark} aria-hidden>
        ALBUMS
      </div>
      <span className={head.kicker}>Collections &amp; Series</span>
      <h1 className={head.title}>Albums</h1>
      <p className={head.lede}>Bodies of work created by season and theme</p>
    </header>
  );
}

// ===========================================================================
// CONFIG — the worker's GET /albums returns every top-level bucket folder
// (except `portfolio`) as an album, e.g.
//   [{ "name": "Inktober 2020", "cover": "Inktober 2020/Day 12.jpg" }, ...]
// The cover key (folder + filename) is resolved against the public R2 base.
const ALBUMS_LIST_URL =
  "https://tasmia-portfolio.tasmia-art-gallery.workers.dev/albums";
// Public R2 bucket root (same bucket as the portfolio gallery).
const ALBUMS_R2_BASE = "https://pub-b82d94c1c7a147bfb13506d072e298b7.r2.dev";
// ===========================================================================

// Resize + compress an image via the free wsrv.nl proxy (webp, CDN-cached),
// so album covers transfer small. https://wsrv.nl/docs/
function sized(url: string, w: number, q = 75): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&output=webp&q=${q}`;
}

interface RawAlbum {
  name: string;
  cover: string | null;
}

interface Album {
  name: string;
  title: string;
  tag: string;
  year: string;
  cover: string | null;
}

interface MetadataAlbum {
  title: string;
  images: Record<
    string,
    { title: string; description?: string; filename: string }
  >;
}

type Metadata = Record<string, MetadataAlbum>;

// Derive the album's tag/subtitle from its folder name.
// Add more cases here as new albums are added to the bucket.
function getAlbumTag(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("inktober")) return "Inktober";
  if (
    n.includes("thailand") ||
    n.includes("nepal") ||
    n.includes("thai") ||
    n.includes("nz") ||
    n.includes("diaries") ||
    n.includes("shots")
  )
    return "Travel";
  if (n.includes("portrait")) return "Series";
  // default fallback
  return "Collection";
}

// Pull a 4-digit year from the name: "Inktober 2020" -> "2020".
function parseYear(name: string): string {
  const m = name.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : "";
}

export default function AlbumsGrid() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch metadata (for album titles)
        const metaRes = await fetch("/albums-metadata.json");
        if (!metaRes.ok) throw new Error(`Metadata HTTP ${metaRes.status}`);
        const metaData: unknown = await metaRes.json();

        // Fetch albums
        const res = await fetch(ALBUMS_LIST_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (cancelled) return;

        const raw: RawAlbum[] = Array.isArray(data)
          ? (data as RawAlbum[]).filter((a) => a && typeof a.name === "string")
          : [];

        if (raw.length === 0) {
          setStatus("empty");
          return;
        }

        const list: Album[] = raw.map((a) => {
          const metaAlbum = (metaData as Metadata)?.[a.name];
          return {
            name: a.name,
            title: metaAlbum?.title || a.name,
            tag: getAlbumTag(a.name),
            year: parseYear(a.name),
            // cover key includes spaces/folders — encodeURI keeps "/" but escapes spaces
            cover: a.cover ? encodeURI(`${ALBUMS_R2_BASE}/${a.cover}`) : null,
          };
        });

        setAlbums(list);
        setStatus("ready");
      } catch (err) {
        console.error("Error fetching albums:", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== "ready") {
    return (
      <>
        <AlbumsHeader />
        <div className={styles.status}>
          {status === "loading" && (
            <>
              <span className={styles.spinner} aria-hidden />
              Loading albums&hellip;
            </>
          )}
          {status === "empty" && "No albums to display yet."}
          {status === "error" && "Unable to load albums right now."}
        </div>
      </>
    );
  }

  return (
    <>
      <AlbumsHeader />
      <div className={styles.grid}>
      {albums.map((album, i) => (
        <Link
          key={album.name}
          href={`/albums/${encodeURIComponent(album.name)}`}
          className={styles.card}
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          {album.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sized(album.cover, 700)}
              alt={album.title}
              className={styles.cover}
              draggable={false}
              loading="lazy"
            />
          ) : (
            <span className={styles.coverFallback} aria-hidden />
          )}
          <span className={styles.scrim} />
          <span className={styles.info}>
            <span className={styles.tag}>{album.tag}</span>
            <span className={styles.albumTitle}>{album.title}</span>
            {album.year && <span className={styles.year}>{album.year}</span>}
            <span className={styles.view}>
              View Album <span className={styles.arr}>→</span>
            </span>
          </span>
        </Link>
      ))}
      </div>
    </>
  );
}
