import Sketch from "react-p5";
import React from "react";

const balls = [];
const density = 0.00005;
let screenWidth = window.innerWidth + 10;
let screenHeight = window.innerHeight + 10;

export default class Idler extends React.Component {
  setup = (p5, parentRef) => {
    p5.frameRate(15);
    const pix = screenHeight * screenWidth;
    p5.createCanvas(screenWidth, screenHeight).parent(parentRef);
    for (let i = 0; i < pix * density; i++) {
      let thisBall = new Ball(
        p5.random(screenWidth),
        p5.random(screenHeight),
        p5.random(6) + 3,
        Math.exp(p5.random(4) + 3) / 1000 + 1,
        p5.random(360)
      );
      balls.push(thisBall);
    }

    p5.stroke(255);
  };

  draw = (p5) => {
    p5.background(32);

    for (let i = 0; i < balls.length; i++) {
      balls[i].update();
      p5.stroke(200, 100);
      p5.strokeWeight(2);
      p5.fill(0);
      p5.ellipse(balls[i].x, balls[i].y, balls[i].size, balls[i].size);
    }
    for (let i = 0; i < balls.length - 1; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        let distance = p5.dist(balls[i].x, balls[i].y, balls[j].x, balls[j].y);
        if (distance < 100){
          p5.stroke(150);
          p5.line(balls[i].x, balls[i].y, balls[j].x, balls[j].y);
        }
        else if (distance < 150) {
          p5.stroke(100);
          let chance = 0.3 ** (((p5.random(0.2) + 0.8) * distance) / 150);
          if (chance < 0.5) {
            p5.stroke(50);
          }
          p5.line(balls[i].x, balls[i].y, balls[j].x, balls[j].y);
        }
      }
    }
  };
  render() {
    const windowResized = (p5) => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      screenWidth = window.innerWidth + 10;
      screenHeight = window.innerHeight + 10;
    };
    return (
      <Sketch
        windowResized={windowResized}
        setup={this.setup}
        draw={this.draw}
        style={{ position: "fixed", zIndex: -69 }}
      />
    );
  }
}

class Ball {
  constructor(x, y, size, speed, angle) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.angle = angle;
    this.calcChange();
  }

  calcChange() {
    this.xSpeed = this.speed * Math.sin((this.angle * Math.PI) / 180);
    this.ySpeed = this.speed * Math.cos((this.angle * Math.PI) / 180);
  }

  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    if (this.x > screenWidth) {
      this.x -= screenWidth;
    } else if (this.x < 0) {
      this.x += screenWidth;
    }
    if (this.y > screenHeight) {
      this.y -= screenHeight;
    } else if (this.y < 0) {
      this.y += screenHeight;
    }
  }
}
