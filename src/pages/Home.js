import React from "react";
import ChessBed from "../componets/ChessBed.js";

export default function Home() {
  const langstyle = {
    width: "350px",
    height: "165px",
    border: "none",
    display: "block"
  };

  return (
    <div id="home">
      <div className="homeground">
        <div className="relative">
          <div className="flex">
            <div id="HomeContent" data-aos="fade-up">
              <h1>Andrew Simonson</h1>
              <h3>
                Computer Science student at Rochester Institute of Technology
              </h3>
            </div>
          </div>
          <div className="onRight" data-aos="fade-up">
            <iframe
              title="langstats"
              src="https://github-readme-stats.vercel.app/api/top-langs/?username=asimonson1125&layout=compact&show_icons=true&theme=gruvbox"
              style={langstyle}
            ></iframe>
            <div className="chess">
              <ChessBed username="asimonson1125"></ChessBed>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
