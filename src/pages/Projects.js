import React, { useEffect } from "react";
import ProjectList from "../componets/ProjectList";
import Project from "../componets/Project";
import { toggle } from "../scripts/checkbox";
import github from "../assets/icons/github.svg";
import globe from "../assets/icons/globe.svg";

import geovisF from "../assets/photos/geovisF.png";
import chessbed from "../assets/photos/chessbed.png";
import occupyrit from "../assets/photos/occupyRIT.png";
import slate from "../assets/photos/slate.png";
import website from "../assets/photos/website.png";
import resume from "../assets/photos/resume.png";
import yugoslavia from "../assets/photos/ceoOfYugo.png";
import vexbutt from "../assets/photos/vexcodeButtons.jpeg";

export default function Projects() {
  useEffect(() => {
    // This will run when the page first loads and whenever the title changes
    document.title = "Andrew Simonson - Projects";
  }, []);

  return (
    <div className="foreground" onLoad={() => toggle('')}>
      <meta
        name="description"
        content="Recent projects by Andrew Simonson on his lovely portfolio website :)"
      />
      <div data-aos="fade-up">
        <h2 className="concentratedHead">Projects</h2>
        <p>
          Project status is indicated by the color of the project card:
          <br />
          <span className="complete">⬤</span> - Complete
          <br />
          <span className="WIP">⬤</span> - Work In Progress
          <br />
          <span className="incomplete">⬤</span> - Incomplete
        </p>
      </div>
      <div className="checkbox-wrapper">
        <div className="flex start">
        <label className="switch" htmlFor="pinned">
          <input type="checkbox" id="pinned" onClick={() => toggle('')} defaultChecked/>
          <div className="slider round"></div>
          <strong>Pinned</strong>
        </label>
        </div>
        <div className="flex start">
        <label className="switch" htmlFor="programming">
          <input type="checkbox" id="programming" onClick={() => toggle('')} />
          <div className="slider round"></div>
          <strong>Programming</strong>
        </label>
        </div>
        <div className="flex start">
        <label className="switch" htmlFor="geospacial" onClick={() => toggle('')}>
          <input type="checkbox" id="geospacial" />
          <div className="slider round"></div>
          <strong>Geospacial</strong>
        </label>
        </div>
      </div>
      <ProjectList classes="checkbox-client">
        <Project
          status="complete"
          title="Lower 48 Alt. Energy Map"
          bgi={geovisF}
          classes="pinned geospacial"
          links={[
            [
              "https://ritarcgis.maps.arcgis.com/apps/dashboards/17d5bda01edc4a2eb6205a4922d889c9",
              <img alt="ArcGIS" src={globe} />,
            ],
          ]}
        >
          ArcGIS Map of the most effective alternative energy sources in the
          continental United States
        </Project>
        <Project
          status="WIP"
          title="OccupyRIT"
          classes="pinned programming"
          bgi={occupyrit}
          links={[
            [
              "https://github.com/asimonson1125/Occupy-RIT",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          Collects RIT Gym Occupancy data, determining busiest workout
          times.
        </Project>
        <Project
          status="complete"
          title="Chesscom Embeds"
          classes="programming"
          bgi={chessbed}
          links={[
            [
              "https://github.com/asimonson1125/chesscom-embed",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          A template for creating Chess.com user profile embeds
        </Project>
        <Project
          status="complete"
          title="Resume"
          classes="programming"
          bgi={resume}
          links={[
            [
              "https://github.com/asimonson1125/Resume",
              <img alt="github" src={github} />,
            ],
            [
              "https://asimonson.com/Resume.pdf/",
              <img alt="site" src={globe} />,
            ],
          ]}
        >
          My Resume, made in LaTeX with a custom design derived by the AltaCV
          template on OverLeaf.
        </Project>
        <Project
          status="WIP"
          title="Digital Portfolio"
          classes="programming"
          bgi={website}
          links={[
            [
              "https://github.com/asimonson1125/asimonson1125.github.io",
              <img alt="github" src={github} />,
            ],
            ["https://asimonson.com/", <img alt="site" src={globe} />],
          ]}
        >
          A personal portfolio site made with React.js.
        </Project>
        <Project
          status="complete"
          title="Slate"
          classes="pinned programming"
          bgi={slate}
          links={[
            [
              "https://github.com/asimonson1125/Slate",
              <img alt="github" src={github} />,
            ],
            ["https://slate.csh.rit.edu/", <img alt="site" src={globe} />],
          ]}
        >
          Slate is a web app designed to help event coordinators schedule events
          by congregating participant calendar data. Includes Computer Science
          House account integration.
        </Project>
        <Project
          status="complete"
          title="Humans vs. Zombies Bot"
          classes="programming"
          links={[
            [
              "https://github.com/asimonson1125/HvZ-bot",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          A Discord bot to handle role management and statistics for RIT's
          Humans vs. Zombies games.
        </Project>
        <Project
          status="WIP"
          title="FinTech"
          classes="pinned programming"
          links={[
            [
              "https://github.com/LukeHorigan/Financial-Management-Assocation-",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          A team derived from the RIT Financial Management Association dedicated
          to learning about financial management of equities using automated
          solutions developed by students.
        </Project>
        <Project status="complete" classes="programming" title="Browser Trivia Bot">
          A tampermonkey tool used to automatically answer and submit online
          trivia forms, which can be tailored to different site layouts.
          <br />
          <br />
          Source is currently private.
        </Project>
        <Project
          status="complete"
          title="Querist"
          classes="programming"
          links={[
            [
              "https://github.com/asimonson1125/Querist",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          A modular discord bot to manage class discord servers divided by class
          sections. Used in my Web and Mobile 101 class discord server.
        </Project>
        <Project
          status="complete"
          title="Acumen"
          classes="programming"
          links={[
            [
              "https://github.com/asimonson1125/Acumen",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          A personal Discord bot focused on statistical insight and role
          management for NationsGame, including NG Rolls Sim accessibility.
        </Project>
        <Project
          status="complete"
          title="NationsGame Rolls Sim"
          classes="programming"
          bgi={yugoslavia}
          links={[
            [
              "https://github.com/asimonson1125/NG-Rolls-Simulator",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          A simulator for the browser game, NationsGame, to analyze unit
          composition and predict in-game victors and unit statistics.
          <br />
          Unfortunately, NationsGame is now defunct. Limited screenshots of
          functionality.
        </Project>
        <Project
          status="incomplete"
          title="WallCycle"
          classes="programming"
          links={[
            [
              "https://github.com/asimonson1125/WallCycle",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          A GNOME extension that cycles through a folder of wallpapers.
        </Project>
        <Project
          status="complete"
          title="VEXcode Button Engine"
          classes="programming"
          bgi={vexbutt}
          links={[
            [
              "https://github.com/asimonson1125/VEXcode-Button-Generator",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          VEXcode button library + examples and template for the VEX V5 brain
        </Project>
        <Project
          status="complete"
          title="WinKeylogger"
          classes="programming"
          links={[
            [
              "https://github.com/asimonson1125/WinKeylogger",
              <img alt="github" src={github} />,
            ],
          ]}
        >
          A C++ keylogger for windows based off a udemy course with my custom
          modifications and powershell script.
        </Project>
      </ProjectList>
    </div>
  );
}
