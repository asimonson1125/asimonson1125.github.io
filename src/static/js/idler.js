const balls = [];
const density = 0.00003;
let screenWidth = window.innerWidth + 10;
let screenHeight = window.innerHeight + 10;

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
    this.draw();
  }

  draw() {
    stroke(200, 100);
    strokeWeight(2);
    fill(0);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

function setup() {
  frameRate(15);
  const pix = screenHeight * screenWidth;
  createCanvas(screenWidth, screenHeight);
  for (let i = 0; i < pix * density; i++) {
    let thisBall = new Ball(
      random(screenWidth),
      random(screenHeight),
      random(6) + 3,
      Math.exp(random(4) + 3) / 1000 + 1,
      random(360)
    );
    balls.push(thisBall);
  }

  stroke(255);
}

function windowResized() {
  screenWidth = window.innerWidth + 10;
  screenHeight = window.innerHeight + 10;
  resizeCanvas(screenWidth, screenHeight);
}

function draw() {
  background(32);

  for (let i = 0; i < balls.length; i++) {
    balls[i].update();
  }
  for (let i = 0; i < balls.length - 1; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let distance = dist(balls[i].x, balls[i].y, balls[j].x, balls[j].y);
      if (distance < 100){
        stroke(150);
        line(balls[i].x, balls[i].y, balls[j].x, balls[j].y);
      }
      else if (distance < 150) {
        stroke(100);
        let chance = 0.3 ** (((random(0.2) + 0.8) * distance) / 150);
        if (chance < 0.5) {
          stroke(50);
        }
        line(balls[i].x, balls[i].y, balls[j].x, balls[j].y);
      }
    }
  }
}
