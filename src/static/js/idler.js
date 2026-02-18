const balls = [];
const density = 0.00005;
let screenWidth = window.innerWidth + 10;
let screenHeight = window.innerHeight + 10;

const MAX_DIST = 150;
const MAX_DIST_SQUARED = MAX_DIST * MAX_DIST;

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
    const radians = (this.angle * Math.PI) / 180
    this.xSpeed = this.speed * Math.sin(radians);
    this.ySpeed = this.speed * Math.cos(radians);
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
  const pixels = screenHeight * screenWidth;
  createCanvas(screenWidth, screenHeight);
  for (let i = 0; i < pixels * density; i++) {
    balls.push(new Ball(
      random(screenWidth),
      random(screenHeight),
      random(6) + 3,
      Math.exp(random(4) + 3) / 1000 + 1,
      random(360)
    ));
  }
  stroke(255);
}

function windowResized() {
  screenWidth = window.innerWidth + 10;
  screenHeight = window.innerHeight + 10;
  resizeCanvas(screenWidth, screenHeight);
}

function draw() {
  background(24);

  for (let i = 0; i < balls.length; i++) {
    balls[i].update();
  }

  // Draw connection lines with additive blending so overlaps brighten
  blendMode(ADD);
  strokeWeight(2);

  for (let i = 0; i < balls.length - 1; i++) {
    const a = balls[i];
    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSquared = dx * dx + dy * dy;

      if (distSquared < MAX_DIST_SQUARED) {
        const distance = Math.sqrt(distSquared);
        if (distance < 75) {
          stroke(255, 85);
        } else {
          const chance = 0.3 ** (((random(0.2) + 0.8) * distance) / MAX_DIST);
          stroke(255, chance < 0.5 ? 40 : 75);
        }
        line(a.x, a.y, b.x, b.y);
      }
    }
  }

  blendMode(BLEND);
}
