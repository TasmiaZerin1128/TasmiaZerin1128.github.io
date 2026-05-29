import Image from "next/image";
import Link from "next/link";

const galleryItems = [
  { image: "/images/img1.jpg", title: "Cinderella", type: "text" },
  { image: "/images/img2.jpg", title: "We Bare Bears", type: "text" },
  { image: "/images/img3.jpg", title: "Musical World", type: "text" },
  { image: "/images/img4.jpg", title: "Minimalistic Portrait", type: "text" },
  { image: "/images/img5.png", title: "Movie Clip Arts", type: "text" },
  { image: "/images/img6.jpg", title: "Spider Eye", type: "text" },
  { image: "/images/img7.jpg", title: "Mother of the Dragons", type: "text" },
  { image: "/images/img8.jpg", title: "Vector Portrait", type: "text" },
  {
    image: "/images/img9.jpg",
    title: "Institute of Information Technology\nUniversity of Dhaka",
    type: "text2",
  },
];

export default function GallerySection() {
  return (
    <section className="gallery" id="gallery">
      <div className="max-width">
        <h2 className="title">My Gallery</h2>
        <div className="gallery-grid">
          <Link href="/art" className="card art-link-card">
            <div className="art-link-inner">
              <span className="art-link-eyebrow">— Featured —</span>
              <span className="art-link-title">THE ART OF TASMIA</span>
              <span className="art-link-arrow">EXPLORE GALLERY →</span>
            </div>
          </Link>
          {galleryItems.map((item) => (
            <div className="card" key={item.image}>
              <div className="box">
                <a href={item.image} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={400}
                    height={250}
                    style={{ height: "250px", width: "auto", objectFit: "cover" }}
                    unoptimized
                  />
                </a>
                {item.type === "text2" ? (
                  <div className="text2">
                    Institute of Information Technology
                    <br />
                    University of Dhaka
                  </div>
                ) : (
                  <div className="text">{item.title}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
