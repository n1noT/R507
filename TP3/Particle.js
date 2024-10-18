class Particle {

    constructor() {
      this.x = mouseX;
      this.y = mouseY;
      this.vx = random(-1, 1);
      this.vy = random(-3, -1);
      this.alpha = 255;
    }
  
    finished() {
      return this.alpha < 0;
    }
  
    update() {
      let wind = cos(frame * 0.01 + this.alpha / 50 ) * 2;
      this.x += this.vx + wind;
      this.y += this.vy + wind;
      this.alpha -= 5;
    }
  
    show() {
      noStroke();
      fill(255, this.alpha, 100, this.alpha);
      ellipse(this.x, this.y, 16);
    }
  
  }