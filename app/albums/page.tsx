import type { Metadata } from "next";
import ArtNavbar from "../components/ArtNavbar";
import CustomCursor from "../components/CustomCursor";
import Footer from "../components/Footer";
import AlbumsGrid from "../components/AlbumsGrid";
import styles from "./albums.module.css";

export const metadata: Metadata = {
  title: "Albums — Tasmia's Gallery",
  description:
    "Bodies of work gathered by season and theme — Inktober runs, travel sketchbooks, and portrait series.",
};

export default function AlbumsPage() {
  return (
    <div className={`art-page ${styles.shell}`}>
      <CustomCursor />
      <div className={styles.bg} />
      <ArtNavbar />

      <main className={styles.wrap}>
        <AlbumsGrid />
      </main>

      <Footer />
    </div>
  );
}
