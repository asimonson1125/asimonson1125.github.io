const balls = [];
const density = 0.00005;
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
  background(24);

  // Update all balls
  for (let i = 0; i < balls.length; i++) {
    balls[i].update();
  }

  // Optimize line drawing with early distance checks
  const maxDist = 150;
  const maxDistSquared = maxDist * maxDist; // Avoid sqrt in distance calculation

  for (let i = 0; i < balls.length - 1; i++) {
    const ball1 = balls[i];
    for (let j = i + 1; j < balls.length; j++) {
      const ball2 = balls[j];

      // Quick rejection test using squared distance (faster than sqrt)
      const dx = ball2.x - ball1.x;
      const dy = ball2.y - ball1.y;
      const distSquared = dx * dx + dy * dy;

      if (distSquared < maxDistSquared) {
        const distance = Math.sqrt(distSquared); // Only calculate sqrt if needed

        if (distance < 100) {
          stroke(150);
          line(ball1.x, ball1.y, ball2.x, ball2.y);
        } else {
          stroke(100);
          const chance = 0.3 ** (((random(0.2) + 0.8) * distance) / 150);
          if (chance < 0.5) {
            stroke(50);
          }
          line(ball1.x, ball1.y, ball2.x, ball2.y);
        }
      }
    }
  }
}
