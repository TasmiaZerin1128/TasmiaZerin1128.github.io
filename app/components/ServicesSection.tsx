import SectionHeader from "./SectionHeader";

// Drawn from the professional CV — describes the work, never the clients.
const services = [
  {
    icon: "fas fa-database",
    title: "Data Engineering & ETL",
    description:
      "Building data orchestration pipelines that gather, clean, and structure data from many sources into analysis-ready formats — scheduled workflows, timezone-safe loaders, and continuously optimized ETL.",
    tags: ["Python", "Apache Airflow", "GCP", "Pandas", "Docker"],
  },
  {
    icon: "fas fa-server",
    title: "Backend & REST APIs",
    description:
      "Designing scalable RESTful services with secure authentication — JWT, OAuth 2.0, and role-based access control — backed by both SQL and NoSQL databases.",
    tags: ["FastAPI", "NodeJS", "ExpressJS", "MySQL", "MongoDB"],
  },
  {
    icon: "fas fa-laptop-code",
    title: "Frontend Development",
    description:
      "Crafting responsive, intuitive interfaces with modern component-driven stacks — from quick Figma prototypes to polished production UIs.",
    tags: ["ReactJS", "NextJS", "Tailwind CSS", "Figma"],
  },
  {
    icon: "fas fa-robot",
    title: "AI-Powered Applications",
    description:
      "Turning LLM tooling into practical products — RAG pipelines, intelligent task summarizers, and prompt-engineered workflows that cut through information overload.",
    tags: ["LangChain", "RAG", "Prompt Engineering", "Streamlit"],
  },
];

export default function ServicesSection() {
  return (
    <section className="services" id="services">
      <div className="max-width">
        <SectionHeader title="What I Do" subtitle="What I Provide" dark />
        <div className="serv-grid">
          {services.map((service, i) => (
            <div className="serv-card" key={service.title}>
              <span className="serv-card-num" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="serv-card-icon">
                <i className={service.icon}></i>
              </span>
              <h3 className="serv-card-title">{service.title}</h3>
              <p className="serv-card-desc">{service.description}</p>
              <div className="serv-card-tags">
                {service.tags.map((tag) => (
                  <span className="serv-tag" key={tag}>
                    {tag}
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
