import Navbar from "./components/Navbar";
import ScrollUpButton from "./components/ScrollUpButton";
import HomeSection from "./components/HomeSection";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import SkillsSection from "./components/SkillsSection";
import ProjectsSection from "./components/ProjectsSection";
import GallerySection from "./components/GallerySection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <ScrollUpButton />
      <Navbar />
      <HomeSection />
      <AboutSection />
      <ServicesSection />
      <SkillsSection />
      <ProjectsSection />
      <GallerySection />
      <Footer />
    </>
  );
}
