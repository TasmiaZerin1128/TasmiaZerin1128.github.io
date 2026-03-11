const skills = [
  { name: "C++", percent: "95%", className: "cpp" },
  { name: "Java", percent: "90%", className: "java" },
  { name: "AngularJS", percent: "80%", className: "angularjs" },
  { name: "Adobe Illustrator", percent: "95%", className: "ai" },
  { name: "Figma", percent: "85%", className: "figma" },
  { name: "Unity", percent: "75%", className: "unity" },
];

export default function SkillsSection() {
  return (
    <section className="skills" id="skills">
      <div className="max-width">
        <h2 className="title">My Skills</h2>
        <div className="skills-content">
          <div className="column left">
            <div className="text">My creative skills &amp; experiences</div>
            <p>
              Have learnt several languages, frameworks and tools. I also have
              little experience on web apps, android apps using Unity. However, I
              have skills on adobe illustrator, so I can make illustrations and
              digital arts of anything. Also, I have done some UIs of apps using
              figma.
            </p>
          </div>
          <div className="column right">
            {skills.map((skill) => (
              <div className="bars" key={skill.name}>
                <div className="info">
                  <span>{skill.name}</span>
                  <span>{skill.percent}</span>
                </div>
                <div className={`line ${skill.className}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
