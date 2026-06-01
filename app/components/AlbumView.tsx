"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AlbumDetail from "./AlbumDetail";
import styles from "./AlbumsGrid.module.css";

// Same sources as AlbumsGrid.
const ALBUMS_LIST_URL =
  "https://tasmia-portfolio.tasmia-art-gallery.workers.dev/albums";
const ALBUMS_R2_BASE = "https://pub-b82d94c1c7a147bfb13506d072e298b7.r2.dev";

interface RawAlbum {
  name: string;
  cover: string | null;
}

// One image as listed by the worker's GET /albums/:name (straight from R2).
interface R2Image {
  key: string;
  filename: string;
  url: string;
}

// Per-image override from albums-metadata.json — keyed by filename.
interface ImageMeta {
  title?: string;
  description?: string;
  filename?: string;
}

interface MetadataAlbum {
  title?: string;
  description?: string;
  images?: Record<string, ImageMeta>;
}

type Metadata = Record<string, MetadataAlbum>;

// Shape AlbumDetail consumes: a record keyed however, each entry carrying its
// own filename + (possibly enriched) title/description.
interface DetailImage {
  title: string;
  description?: string;
  filename: string;
}

// "Day 1.png" -> "Day 1"
function stripExtension(filename: string): string {
  return filename.replace(/\.[^./\\]+$/, "");
}

export default function AlbumView({ albumName }: { albumName: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [albumMeta, setAlbumMeta] = useState<MetadataAlbum | undefined>();
  const [detailImages, setDetailImages] = useState<
    Record<string, DetailImage>
  >({});
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 1) Images straight from R2 (source of truth for what exists).
        const imgRes = await fetch(
          `${ALBUMS_LIST_URL}/${encodeURIComponent(albumName)}`
        );
        if (!imgRes.ok) throw new Error(`Images HTTP ${imgRes.status}`);
        const r2Images = (await imgRes.json()) as R2Image[];

        // 2) Optional metadata overrides (title/description per filename).
        let meta: Metadata = {};
        try {
          const metaRes = await fetch("/albums-metadata.json");
          if (metaRes.ok) meta = (await metaRes.json()) as Metadata;
        } catch {
          /* metadata is optional — ignore */
        }

        // 3) Cover key from the album list (unchanged behavior).
        let coverUrl: string | null = null;
        try {
          const listRes = await fetch(ALBUMS_LIST_URL);
          if (listRes.ok) {
            const list = (await listRes.json()) as RawAlbum[];
            const match = Array.isArray(list)
              ? list.find((a) => a && a.name === albumName)
              : undefined;
            coverUrl = match?.cover
              ? encodeURI(`${ALBUMS_R2_BASE}/${match.cover}`)
              : null;
          }
        } catch {
          /* cover is optional */
        }

        if (cancelled) return;

        const albumMetaEntry = meta[albumName];
        const metaImages = albumMetaEntry?.images ?? {};

        // Index metadata by basename (filename without extension), case-insensitive,
        // so overrides match no matter what extension the R2 file uses. An entry's
        // filename field is preferred; fall back to its object key.
        const metaByBase = new Map<string, ImageMeta>();
        for (const [key, m] of Object.entries(metaImages)) {
          const base = stripExtension(m?.filename || key).toLowerCase();
          metaByBase.set(base, m);
        }

        // Merge: default name = filename without extension, description blank;
        // override with metadata when present (matched by basename, not extension).
        const merged: Record<string, DetailImage> = {};
        for (const img of r2Images) {
          if (!img || typeof img.filename !== "string") continue;
          if (img.filename.endsWith("/")) continue; // skip folder markers
          const base = stripExtension(img.filename);
          const override = metaByBase.get(base.toLowerCase());
          merged[img.filename] = {
            filename: img.filename,
            title: override?.title || base,
            description: override?.description || "",
          };
        }

        setDetailImages(merged);
        setAlbumMeta(albumMetaEntry);
        setCover(coverUrl);
        setStatus("ready");
      } catch (err) {
        console.error("Error loading album:", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [albumName]);

  if (status === "loading") {
    return (
      <div className={styles.status}>
        <span className={styles.spinner} aria-hidden />
        Loading album&hellip;
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.status}>Unable to load this album right now.</div>
    );
  }

  return (
    <AlbumDetail
      albumName={albumName}
      albumTitle={albumMeta?.title || albumName}
      metadata={{ title: albumMeta?.title || albumName, images: detailImages }}
      cover={cover}
      onClose={() => router.push("/albums")}
    />
  );
}
