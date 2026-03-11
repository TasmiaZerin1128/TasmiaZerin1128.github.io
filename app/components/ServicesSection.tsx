export default function ServicesSection() {
  return (
    <section className="services" id="services">
      <div className="max-width">
        <h2 className="title">My Services</h2>
        <div className="serv-content">
          <div className="card">
            <div className="box">
              <i className="fas fa-pen"></i>
              <div className="text">Front-End Development</div>
              <p>
                Minimalistic front-End using AngularJS and figma prototyping
              </p>
            </div>
          </div>
          <div className="card">
            <div className="box">
              <i className="fas fa-code"></i>
              <div className="text">Apps Design</div>
              <p>
                App design combines the user interface (UI) and user experience
                (UX).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="box">
              <i className="fas fa-paint-brush"></i>
              <div className="text">Digital Art</div>
              <p>
                Digital contents such as, banner, poster, certificate,
                invitation cards for various institutional events
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
