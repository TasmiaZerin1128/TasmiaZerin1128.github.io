import SectionHeader from "./SectionHeader";

// Kept in sync with the Tools & Technology section of the CV.
const skillGroups = [
  {
    icon: "fas fa-code",
    name: "Languages",
    items: ["JavaScript", "Python", "Java", "C++", "C#", "PHP"],
  },
  {
    icon: "fas fa-layer-group",
    name: "Frameworks",
    items: [
      "FastAPI",
      "ReactJS",
      "NextJS",
      "NodeJS",
      "ExpressJS",
      "Tailwind CSS",
    ],
  },
  {
    icon: "fas fa-cloud",
    name: "Cloud & Orchestration",
    items: ["GCP", "Cloud Composer", "Pub/Sub", "Apache Airflow", "Docker"],
  },
  {
    icon: "fas fa-database",
    name: "Data & Databases",
    items: ["SQL", "MySQL", "MongoDB", "Firebase", "Pandas", "BeautifulSoup4"],
  },
  {
    icon: "fas fa-chart-line",
    name: "AI & Monitoring",
    items: [
      "LangChain",
      "Prompt Engineering",
      "Streamlit",
      "Grafana",
      "Prometheus",
    ],
  },
  {
    icon: "fas fa-pen-nib",
    name: "Design & Tools",
    items: ["Figma", "Adobe Illustrator", "Unity", "Git"],
  },
];

export default function SkillsSection() {
  return (
    <section className="skills" id="skills">
      <div className="max-width">
        <SectionHeader title="My Skills" subtitle="What I Know" />
        <p className="skills-lede">
          From data pipelines to polished interfaces — the tools I work with
          every day.
        </p>
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <div className="skill-card" key={group.name}>
              <div className="skill-card-head">
                <span className="skill-card-icon">
                  <i className={group.icon}></i>
                </span>
                <h3 className="skill-card-name">{group.name}</h3>
              </div>
              <div className="skill-chips">
                {group.items.map((item) => (
                  <span className="skill-chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
