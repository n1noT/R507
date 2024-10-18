const deltaT = 0.1;
let gravity = 0.5;
const damping = 0.99;
const stiffness = 0.99;
const friction = 0.005;
const maxVel = 150;

let circles = [];


function setup() {
    createCanvas(windowWidth, windowHeight);
    
    for (let i = 0; i < 200; i++) {
        // centerX centerY radius segments
        let circle = new Circle(Math.random() * windowWidth, Math.random() * windowHeight, Math.random() * 50+20, Math.random() * 10 + 8);
        circles.push(circle);
    }
}

function mousePressed() {
    for (let c of circles) {
        for (let m of c.masses) {
            let d = m.position.copy();
            d.sub(createVector(mouseX, mouseY));
            d.normalize();
            d.mult(100);
            m.velocity.sub(d);
        }
    }
    
}

function draw() {
    background(255);

    for (let c of circles) {
        c.udpateMasses();
        c.checkCollisionsWithBox(width / 2 - 100, height - 200, 200, 200);
        c.checkCollisonCircle(circles);
        c.udpateSprings();
        c.display();
    }

    fill("white");
    rect(width / 2 - 100, height - 200, 200, 200);
}

