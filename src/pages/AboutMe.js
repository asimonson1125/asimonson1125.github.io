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
    <div className="foreground" onLoad={() => toggle('up')}>
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
          <strong>Work Experience</strong>
        </label>
        </div>
        <div className="flex start">
        <label className="switch" htmlFor="technical" onClick={() => toggle('up')}>
          <input type="checkbox" id="technical" />
          <div className="slider round"></div>
          <strong>Technical</strong>
        </label>
        </div>
      </div>
        <Timeline classes="checkbox-client">
          <TimeItem date='01/2023 - 05/2023' title="Co-op @ Dow Chemical" classes="pinned experience technical">Spring 2023 Semester Co-op under Dow Chemical's Global Reactive Chemicals team in Analytical Sciences.  Responsibilities included management of chemical compatability data and tool creation for parsing, generating, and submitting reports.</TimeItem>
          <TimeItem date='08/26/2021' title='Started Portfolio'>I started building this website on this day.  I wish I could say I was farther along than I am.</TimeItem>
          <TimeItem date='08/2021 - 05/2025' title='Rochester Institute of Technology' classes="pinned education technical">Studying in Rochester Institute of Technology's Computer Science BS program with a minor in International Relations.</TimeItem>
          <TimeItem date='04/2021 - 08/2021' title="Pretzel & Pizza Creations" classes="experience">Worked part-time as a chef, managing active ingredient supply and fulfilling orders.  I personally recommend the stuffed pretzels.</TimeItem>
          <TimeItem date='08/2020 - 12/2020' title="Election Official" classes='experience'>Trained in voter registry operations and provisional voting by the Washington County Board of Elections for the 2020 US Presidential Election.</TimeItem>
          <TimeItem date='09/2016 - 06/2021' title='Boonsboro High School' classes='education'>Graduated high school with highest honors.<br />Member of National Honor Society, Academic Team County Champions.  Participated in Physics Olympics, Robotics Club, and scored at state championships in <a href='https://www.athletic.net/athlete/10265585/track-and-field/high-school'>Cross Country and Track and Field (4x800, 800)</a>. </TimeItem>
          <TimeItem date='10/2015 - 04/2021' title="Vex Robotics Team Lead/Club President" classes='technical'>Led 5 teams through middle and high school to VEX Robotics Competitions, elevating Boonsboro from county group-stage elimination to its first state championship participation.  Reorganized club and set up its first interface with the community + sponsors</TimeItem>
        </Timeline>
      </div>
    </div>
  );
}
