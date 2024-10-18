const deltaT = 0.1;
let gravity = 1;
const damping = 0.99;
const stiffness = 0.99;
const friction = 0.005;
const maxVel = 150;

let masses = [];
let springs = [];

function setup() {
    createCanvas(windowWidth, windowHeight);

    let radius = 100;
    let centerX = Math.random() * windowWidth;
    let centerY = Math.random() * windowHeight;
    let segments = 20;

    for (let i = 0; i < segments; i++) {
        let angle = i * (2.0 * Math.PI / segments);
        let x = centerX + radius * Math.cos(angle);
        let y = centerY + radius * Math.sin(angle);
        masses.push(new Mass(x, y));
    }

    for (let i = 0; i < segments; i++) {
        for (let j = i + 1; j < segments; j++) {
            springs.push(new Spring(masses[i], masses[j]));
        }
    }
}

function mousePressed () {
    for(let m of masses){
       let d = m.position.copy();
        d.sub(createVector(mouseX, mouseY));
        d.normalize();
        d.mult(100);
        m.velocity.sub(d);
    }

}

function draw() {
    background(255);
    for (let masse of masses) {
        masse.display();
        masse.updatePosition();
    }

    for(let s of springs){
        s.applyConstraint();
        s.display();
    }
}
