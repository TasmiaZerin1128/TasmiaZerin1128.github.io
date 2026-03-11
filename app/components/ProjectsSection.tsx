import Image from "next/image";

const projects = [
  {
    image: "/images/chemouflage.jpg",
    title: "Chemouflage",
    description: "An interactive AR learning app for Chemistry",
    link: "https://github.com/TasmiaZerin1128/Chemouflage",
    linkText: "Github",
  },
  {
    image: "/images/fusics.gif",
    title: "FUSICS",
    description: "Learn Physics in an interactive and fun way",
    link: "https://github.com/TasmiaZerin1128/Software-Project-Lab-1",
    linkText: "Github",
  },
  {
    image: "/images/educhain.PNG",
    title: "EduChain",
    description: "A blockchain based educational course provider app",
    link: "https://github.com/jsureka/BUET_Hackathon_GGWP",
    linkText: "Github",
  },
  {
    image: "/images/khelahobe.PNG",
    title: "Khela Hobe",
    description:
      "A web application made with Angular and NodeJs for viewing online games",
    link: "https://github.com/jaf107/origin-mtm",
    linkText: "Github",
  },
  {
    image: "/images/c4.gif",
    title: "Connect 4",
    description: "A game to connect 4 dots in any direction with AI Opponent",
    link: "https://connect4play.netlify.app/",
    linkText: "Play",
  },
  {
    image: "/images/wumpusWorldHome.png",
    title: "Wumpus World",
    description:
      "An AI player based game to steal golds and kill the wumpus",
    link: "https://wumpusworld.netlify.app/",
    linkText: "Play",
  },
  {
    image: "/images/naruto.png",
    title: "Naruto Shippuden Intros",
    description: "Simple webpage showing 4 intros of Naruto Shippuden",
    link: "https://narutoshippudenintros.netlify.app/",
    linkText: "View",
  },
];

export default function ProjectsSection() {
  return (
    <section className="teams" id="projects">
      <div className="max-width">
        <h2 className="title">My Software Projects</h2>
        <div className="projects-grid">
          {projects.map((project) => (
            <div className="card" key={project.title}>
              <div className="box">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={250}
                  height={150}
                  style={{ width: "250px", height: "150px", objectFit: "cover" }}
                  unoptimized
                />
                <div className="text">{project.title}</div>
                <p>{project.description}</p>
                <button className="git">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.linkText}
                  </a>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
