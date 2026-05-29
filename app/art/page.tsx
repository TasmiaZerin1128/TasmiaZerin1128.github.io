import type { Metadata } from "next";
import ArtNavbar from "../components/ArtNavbar";
import ArtHero from "../components/ArtHero";
import ArtGallery from "../components/ArtGallery";
import CustomCursor from "../components/CustomCursor";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "The Art of Tasmia",
  description: "Illustrations and artworks by Tasmia Zerin",
};

export default function ArtPage() {
  return (
    <div className="art-page">
      <CustomCursor />
      <ArtNavbar />
      <ArtHero />
      <ArtGallery />
      <Footer />
    </div>
  );
}
