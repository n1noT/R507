class Circle {
    constructor(centerX, centerY, radius, segments) {
        this.center = createVector(centerX, centerY);
        this.masses = [];
        this.springs = [];
        this.radius = radius;


        for (let i = 0; i < segments; i++) {
            let angle = i * (2.0 * Math.PI / segments);
            let x = centerX + radius * Math.cos(angle);
            let y = centerY + radius * Math.sin(angle);
            this.masses.push(new Mass(x, y));
        }

        for (let i = 0; i < this.masses.length; i++) {
            for (let j = i + 1; j < this.masses.length; j++) {
                this.springs.push(new Spring(this.masses[i], this.masses[j]));
            }
        }

    }

    udpateMasses() {
        for (let m of this.masses) {
            m.updatePosition();
        }

        this.center = createVector(0, 0);
        for (let m of this.masses) {
            this.center.add(m.position);
        }
        this.center.div(this.masses.length);
    }

    checkCollisionsWithBox(centerX, centerY, width, height) {
        let left = centerX;
        let top = centerY;
        let right = left + width;
        let bottom = top + height;
    
        for(let m of this.masses) {
            if(m.position.x < left || m.position.x > right || m.position.y < top || m.position.y > bottom) {
              continue
            }
          
            if(m.position.y > top && m.previousPosition.y <= top) {
              m.position.y = top;
              m.velocity.y = 0;
              m.velocity.x *= friction;
            }
            if(m.position.y < bottom && m.previousPosition.y >= bottom) {
              m.position.y = bottom;
              m.velocity.y = 0;
              m.velocity.x *= friction;
            }
            if(m.position.x > left && m.previousPosition.x <= left) {
              m.position.x = left;
              m.velocity.x = 0;
              m.velocity.y *= friction;
            }
            if(m.position.x < right && m.previousPosition.x >= right) {
              m.position.x = right;
              m.velocity.x = 0;
              m.velocity.y *= friction;
            }
        }  
    }

    checkCollisonCircle(circles) {
        for (let otherCircle of circles) {
            if (otherCircle == this) {
                continue;
            }

            let distance = this.center.copy().sub(otherCircle.center).mag();

            if (distance > this.radius + otherCircle.radius) {
                continue;
            }

            for (let m of this.masses) {
                let d = m.position.copy();
                d.sub(otherCircle.center);
                if(d.mag() < otherCircle.radius) {
                    m.velocity.add(d);
                    d.normalize();
                    d.mult(otherCircle.radius);
                    d.add(otherCircle.center);
                    m.position = d.copy();
                }
            }
        }
    }

    udpateSprings(){
        for (let s of this.springs) {
            s.applyConstraint();
        }
    }
    
    display() {
        for (let m of this.masses) {
            m.display();
        }
    
        for (let s of this.springs) {
            s.display();
        }
    }
}