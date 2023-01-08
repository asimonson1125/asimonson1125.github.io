import React from "react";
// import MyCarousel from "../componets/Carousel.js";
import ChessBed from "../componets/ChessBed.js";
// import HexGrid from "../componets/HexGrid";
import Skills from "../componets/Skills";
import Timeline from '../componets/Timeline';
import TimeItem from "../componets/TimeItem.js";
import { toggle } from "../scripts/checkbox";
// import img1 from '../assets/photos/itsa_me.JPG'
// import img2 from '../assets/photos/me_robot.jpeg'
// import img3 from "../assets/photos/AcademicTeam.jpg";
// import img4 from "../assets/photos/hagerstownVex2019.jpg";
// import img5 from "../assets/photos/WeThePeople_Districts.jpg";
// import img6 from "../assets/photos/WeThePeople.jpg";
// import img7 from "../assets/photos/WeThePeople_NationalsSetup.jpg";

export default function AboutMe() {
  return (
    <div className="foreground">
      <div className="col">
        <div id="aboutMe" data-aos="fade-up">
          <h2 className="concentratedHead">About Me</h2>
          <p>
            I'm Andrew Simonson, a second year (third year standing) student at{" "}
            <strong>Rochester Institute of Technology </strong>
            in the <b>Computer Science</b> BS program, pursuing a career in data
            science with a focus on predictive analytics.
          </p>
          <p>
            When I'm not in class, you can find me working on extra
            collaborative projects, building discord bots, playing chess,
            reading up on some recent geopolitical development, or haphazardly
            expanding my list of unusable, yet bizzarely wise quotes.
          </p>
          {/* <p>
            My goal is to strive to make the biggest positive impact on the
            world that I can. I'm here to improve and optimize what we have so
            that we can spend more time on the things that matter.
          </p>
          <p>
            I also value the ability to understand the world at large. That
            awareness is what grounds a person into reality and gives their
            place in the world value. My favorite part of learning about
            grographies and cultures is when I can justify to myself the hidden
            causality to historic events, which presents an inside look into how
            we can act in the present.
          </p>
          <p>
            It is my belief that being able to channel each distinct creative
            interest into a final product is vital. With this philosophy that
            promotes dedication and enables an in-depth understanding, I can
            take pride in each of my projects, bridging the gap between the the
            multifaceted purpose present in everything around us.
          </p> */}
          {/*<img src={img1} alt='Me' className='boxedImg' />*/}
        </div>
      </div>
      <div className="col">
        <div id="skills" data-aos="fade-up">
          <h2>Skills</h2>
          {/* <div id="skillList">
            <HexGrid></HexGrid>
            <div id="skillDisp">
              <h2></h2>
              <p></p>
            </div>
          </div> */}
          <Skills>
            {[
              "Python",
              "JavaScript",
              "Java",
              "C",
              "C++",
              "MIPS Assembly",
              "Processing",
              "P5.js",
              "SQL",
              "SQLite",
              "PostgreSQL",
              "SQLAlchemy",
              "HTML",
              "CSS",
              "Docker",
              "LaTeX",
              "ArcGIS",
              "Git",
              "Github",
              "Linux",
              "OKD4",
              "Kubernetes",
              "Angular",
              "Flask",
              "Jinja",
              "DOM Scraping",
              "Google API",
              "React",
              "Node.js",
              "ArcGIS",
            ]}
          </Skills>
          <div className="chess">
            <ChessBed username="asimonson1125"></ChessBed>
          </div>
        </div>
        {/* <div data-aos="fade-up" className="elementBlock">
          <h2>Extracirricular Awards</h2>
          <MyCarousel className="carousel" data-aos="fade-up">
            {[
              {
                original: img4,
                description:
                  "High School VEX Robotics President and Team Leader",
              },
              {
                original: img5,
                description:
                  "We the People Civics Competition District Champions",
              },
              {
                original: img6,
                description: "We The People State Civics Competition Champions",
              },
              {
                original: img7,
                description:
                  "what it looks like to compete in We the People Nationals, circa 2020",
              },
              {
                original: img3,
                description: "Academic Team county championships",
              },
            ]}
          </MyCarousel>
        </div> */}
      </div>
      <div className="col">
      <div className="checkbox-wrapper">
        <div className="flex start">
        <label className="switch" htmlFor="pinned">
          <input type="checkbox" id="pinned" onClick={() => toggle('up')} defaultChecked/>
          <div className="slider round"></div>
          <strong>Pinned</strong>
        </label>
        </div>
        <div className="flex start">
        <label className="switch" htmlFor="education">
          <input type="checkbox" id="education" onClick={() => toggle('up')} />
          <div className="slider round"></div>
          <strong>Education</strong>
        </label>
        </div>
        <div className="flex start">
        <label className="switch" htmlFor="experience" onClick={() => toggle('up')}>
          <input type="checkbox" id="experience" />
          <div className="slider round"></div>
          <strong>Experience</strong>
        </label>
        </div>
      </div>
        <Timeline classes="checkbox-client">
          <TimeItem date='01/2023' title="Co-op @ Dow Chemical" classes="pinned experience">Bottomtext</TimeItem>
          <TimeItem date='08/2021' title='Started Computer Science BS at RIT' classes="pinned education"></TimeItem>
        </Timeline>
      </div>
    </div>
  );
}
