import type { Metadata } from "next";
import Image from "next/image";
import styles from "./cv.module.css";

export const metadata: Metadata = {
  title: "Responsive CV - Tasmia Zerin",
};

export default function CVPage() {
  return (
    <div className={styles.cvBody}>
      <div className={styles.container}>
        {/* Left Side */}
        <div className={styles.leftSide}>
          <div className={styles.profileText}>
            <div>
              <h1 className={styles.nameHeading}>
                TASMIA
                <br />
                ZERIN
              </h1>
            </div>
            <h5>
              Software Engineer @ <span>Cefalo Bangladesh Ltd.</span>
            </h5>
          </div>

          {/* Education */}
          <div>
            <h3 className={styles.sectionTitle}>Education</h3>
            <hr className={styles.hr} />
            <div>
              <h5 className={styles.eduInstitution}>IIT, University of Dhaka</h5>
              <h5 className={styles.eduDegree}>BSSE | CGPA: 3.88</h5>
              <h6 className={styles.eduYear}>2019 - 2023</h6>
            </div>
            <div>
              <h5 className={styles.eduInstitution}>IIT, University of Dhaka</h5>
              <h5 className={styles.eduDegree}>MSSE | CGPA: 4.00</h5>
              <h6 className={styles.eduYear}>2024 - 2025</h6>
            </div>
            <div>
              <h5 className={styles.eduInstitution}>Holy Cross College</h5>
              <h5 className={styles.eduDegree}>HSC | Science</h5>
              <h6 className={styles.eduYear}>2016 - 2018</h6>
            </div>
            <div>
              <h5 className={styles.eduInstitution}>
                Holy Cross Girls&apos; High School
              </h5>
              <h5 className={styles.eduDegree}>SSC | Science</h5>
              <h6 className={styles.eduYear}>2006 - 2016</h6>
            </div>
          </div>

          {/* Interests */}
          <div className={styles.interest}>
            <h3 className={styles.sectionTitle}>Interests</h3>
            <hr className={styles.hr} />
            <ul style={{ position: "relative", listStyle: "none", padding: 0 }}>
              {[
                { icon: "fa-palette", label: "Arts & Crafts" },
                { icon: "fa-pen-fancy", label: "Illustrations" },
                { icon: "fa-gamepad", label: "Gaming" },
                { icon: "fa-camera-retro", label: "Photography" },
                { icon: "fa-music", label: "Music" },
              ].map((item) => (
                <li key={item.label} className={styles.interestItem}>
                  <span className={styles.interestIcon}>
                    <i className={`fa fa-solid ${item.icon}`}></i>
                  </span>
                  <span className={styles.interestText}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side */}
        <div className={styles.rightSide}>
          <div className={styles.propic}>
            <Image
              src="/me4.jpg"
              alt="Profile"
              width={180}
              height={240}
              className={styles.propicImg}
            />
            <h4 className={styles.contactLabel}>Contact</h4>
            <div className={styles.vl}></div>
          </div>

          {/* Contact */}
          <div className={styles.contact}>
            <ul className={styles.contactList}>
              {[
                { icon: "fa-phone", text: "+8801886066560" },
                { icon: "fa-envelope", text: "tasmia.zerin.60@gmail.com" },
                { icon: "fa-globe", text: "tasmiazerin1128.github.io" },
                { icon: "fa-map-marker", text: "Dhaka, Bangladesh" },
              ].map((item) => (
                <li key={item.icon} className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    <i className={`fa fa-solid ${item.icon}`}></i>
                  </span>
                  <span className={styles.contactText}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Profile */}
          <div>
            <h3 className={styles.sectionTitleLight}>Profile</h3>
            <hr className={styles.hrLight} />
            <p className={styles.profileDesc}>
              Hi there! I am Tasmia, working as a software engineer in Cefalo Bangladesh Ltd.
              Hope to build many kinds of interesting things (of course now with AI). Wish me luck!
            </p>
          </div>

          {/* Software Projects */}
          <div>
            <h3 className={styles.sectionTitleExperience}>Software Projects</h3>
            <hr className={styles.hrLight} />
            <h5 className={styles.expTitle}>
              Chemouflage | A Learning App for Chemistry
            </h5>
            <p className={styles.expDesc}>
              An app teaching the fundamental basics of Chemistry to the students
              in an interactive way. Gamification technology and Augmented reality
              has been used in this application
            </p>
            <h5 className={styles.expTitle}>
              FUSICS | An Interactive Learning Game for Physics
            </h5>
            <p className={styles.expDesc}>
              An Interactive game where the students can see the animation,
              experiment, practice with real-life scenarios and play with friends
              in multiplayer mode.
            </p>
            <h5 className={styles.expTitle}>
              EduChain | A Blockchain based Course Provider Website
            </h5>
            <p className={styles.expDesc}>
              Course Provider app which uses NFT as a certificate, stakes
              cryptocurrency until the completion of the particular course.
            </p>
          </div>

          {/* Achievements */}
          <div>
            <h3 className={styles.sectionTitleSkill}>Achievements</h3>
            <hr className={styles.hrSkill} />
            <div className={styles.skillBox}>
              {[
                "Champion | Web3 & Blockchain Hackathon | BUET CSE Fest | 2022",
                "Champion | Project Showcasing (Software) | RUET CSE Fest 2k22 | 2022",
                "1st Runners Up | Project Showcasing | MIST Inter University Innovation Fest | 2021",
                "1st Runners Up | Project Idea Competition | Tech Carnival 1.0, CUET | 2021",
                "2nd Runners Up | Hackathon | ITVerse, IIT, DU | 2020",
                "6th Place | Bangladesh Women's Mathematics Olympiad | 2020",
                "1st Runner Up | ICT Category | DUCSU Science & Technology Olympiad | 2020",
              ].map((achievement) => (
                <h5 key={achievement} className={styles.skillItem}>
                  {achievement}
                </h5>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
