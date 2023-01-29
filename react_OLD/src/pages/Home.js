import React, { useEffect } from "react";
import ChessBed from "../componets/ChessBed.js";

export default function Home() {
  const langstyle = {
    width: "350px",
    height: "165px",
    border: "none",
    display: "block",
  };

  useEffect(() => {
    // This will run when the page first loads and whenever the title changes
    document.title = "Andrew Simonson - Portfolio Home";
  }, []);

  return (
    <div id="home">
      <link rel="canonical" href="https://asimonson.com/"></link>
      <meta
        name="description"
        content="Andrew Simonson's Portfolio Website - Homepage"
      />

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
              src="./readme-stats-vercel-01-25-2023.svg"
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