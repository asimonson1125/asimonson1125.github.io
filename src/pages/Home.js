import React from "react";
import ChessBed from "../componets/ChessBed.js";

export default function Home() {
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
            <div className="chess">
              <ChessBed username="asimonson1125"></ChessBed>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
