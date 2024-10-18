import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

gsap.registerPlugin(CustomEase);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0);
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// Fog
// scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

// Light
let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.position.set(50, 100, 10);
light.target.position.set(0, 0, 0);
scene.add(light);
const dlHelper = new THREE.DirectionalLightHelper(light);
scene.add(dlHelper);
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 50;
light.shadow.camera.far = 150;
light.shadow.camera.left = 100;
light.shadow.camera.right = -100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
const camHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(camHelper);

// Plane
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100, 10, 10),
  new THREE.MeshPhongMaterial({
    color: 0xcbcbcb,
  }));
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
plane.castShadow = false;
scene.add(plane);

// Grid helper
const gridHelper = new THREE.GridHelper(100, 40, 0x000000, 0x000000);
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight);
camera.position.set(10, 10, 10);
scene.add(camera);

// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.render(scene, camera);

// Resize 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Stats
const container = document.getElementById('container');
const stats = new Stats();
container.appendChild(stats.dom);

// GUI
const gui = new GUI();
const params = {
  showHelpers: true
}
gui.add(params, "showHelpers");

// Original code from https://tympanus.net/codrops/2021/10/04/creating-3d-characters-in-three-js/
const random = (min, max, float = false) => {
  const val = Math.random() * (max - min) + min;
  if (float) return val;
  return Math.floor(val)
}

const degreesToRadians = (degrees) => {
  return degrees * (Math.PI / 180);
}

class Figure extends THREE.Group{
  constructor(params) {
    super();
    this.params = {
      x: 0,
      y: 0,
      z: 0,
      ry: 0,
    };
    this.position.x = this.params.x;
    this.position.y = this.params.y;
    this.position.z = this.params.z;

    var self = this;
    const loader = new GLTFLoader();
    loader.load('RobotExpressive.glb', function (gltf) {
      self.add(gltf.scene);
      self.loadAnimations(gltf.scene, gltf.animations);

      // Ajouter un BoxHelper autour du robot
      const boxHelper = new THREE.BoxHelper(gltf.scene, 0xff0000);
      self.add(boxHelper);

      // Ajouter un AxesHelper autour du robot
      const axesHelper = new THREE.AxesHelper(5);
      self.add(axesHelper);

      scene.add(self); // Ajoutez cette ligne pour ajouter le modèle à la scène
    
    }, undefined, (e) => {
      console.error(e);
    });
  }

  loadAnimations(model, animations) {
    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};
    this.states = ['Idle', 'Running', 'Jump', 'Punch', "Walking"];

    for (let i = 0; i < animations.length; i++) {
      const clip = animations[i];
      if (this.states.includes(clip.name)) {
        const action = this.mixer.clipAction(clip);
        this.actions[clip.name] = action;

        if (clip.name == 'Jump' || clip.name == 'Punch') {
          action.clampWhenFinished = true;
          action.loop = THREE.LoopOnce;
        }
      };
    }

    this.state = "Idle";
    this.actions['Idle'].play();

  }

  update(dt) {
    this.rotation.y = this.params.ry;
    this.position.y = this.params.y;
    this.position.x = this.params.x;
    this.position.z = this.params.z;

    if (this.mixer)
      this.mixer.update(dt);
  }

  fadeToAction( name, duration ) {
    if ( this.state === name ) return;

    if ( this.actions[this.state] !== this.actions[ name ] ) {
      this.actions[this.state].fadeOut( duration );
    }
    
    this.actions[ name ]
    .reset()
    .setEffectiveTimeScale( 1 )
    .setEffectiveWeight( 1 )
    .fadeIn( duration )
    .play();
    
    this.state = name;
  }
}

const figure = new Figure();

let curve = "M0,0 C0.061,-0.111 0.046,-0.096 0.08,-0.096 0.171,-0.097 0.818,0.89 1,0.889 ";
CustomEase.create("custom", curve);

let jumpTimeline = gsap.timeline();

let rySpeed = 0;
let walkSpeed = 0;

let leftKeyIsDown = false;
let rightKeyIsDown = false;
let upKeyIsDown = false;
let downKeyIsDown = false;
let spaceKeyIsDown = false;

let walkTimeline = gsap.timeline();
walkTimeline.to(figure.params, {
  walkRotation: degreesToRadians(45),
  repeat: 1,
  yoyo: true,
  duration: 0.25,
});
walkTimeline.to(figure.params, {
  walkRotation: degreesToRadians(-45),
  repeat: 1,
  yoyo: true,
  duration: 0.25,
}, ">");
walkTimeline.pause(0);

document.addEventListener('keydown', (e) => {
  if ((e.key == ' ')) // Space
  {
    spaceKeyIsDown = true;
    figure.fadeToAction('Jump', 0.4);
  }

  if (e.key == 'z') {
    upKeyIsDown = true;
    figure.fadeToAction('Running', 0.5);
  }
  if (e.key == 's') {
    downKeyIsDown = true;
    figure.fadeToAction('Walking', 0.5);
  }
  if (e.key == 'q') {
    leftKeyIsDown = true;
  }
  if (e.key == 'd') {
    rightKeyIsDown = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key == ' ') {
    spaceKeyIsDown = false;
    figure.fadeToAction('Idle', 0.5);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key == 'z') {
    upKeyIsDown = false;
    figure.fadeToAction('Idle', 0.5);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key == 's') {
    downKeyIsDown = false;
    figure.fadeToAction('Idle', 0.5);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key == 'q') {
    leftKeyIsDown = false;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key == 'd') {
    rightKeyIsDown = false;
  }
});

//tir
class Bullet extends THREE.Group {
  constructor(x, y, z, ry) {
    super();

    this.x = x;
    this.y = y + 1;
    this.z = z;
    this.ry = ry;
    this.life = 200;

    this.bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshLambertMaterial({ color: 0xff0000 })
    );
    this.bullet.castShadow = true;
    this.add(this.bullet);

    this.position.set(this.x, this.y, this.z);
  }

  isAlive() {
    return this.life > 0;
  }

  update() {
    this.life--;

    const speed = 0.6;
    this.position.x += speed * Math.sin(this.ry);
    this.position.z += speed * Math.cos(this.ry);

  }
}

// Text facing the camera
let text = null;
const fontLoader = new FontLoader();
const myFont = "helvetiker_regular.typeface.json";
const textMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

function createText(count) {
    scene.remove(text);
    fontLoader.load(myFont, (font) => {
        const textGeometry = new TextGeometry('Shots: ' + count, {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5,
        });

        text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(0, 2, 0);
        scene.add(text);
    });
}

createText(0);

let bullets = [];
document.addEventListener('keydown', (e) => {
  if (e.key == 'f') {
    //createText(bullets.length);
    figure.fadeToAction('Punch', 0.4);
    let bullet = new Bullet(
      figure.params.x,
      figure.params.y,
      figure.params.z,
      figure.params.ry
    )
    scene.add(bullet);
    bullets.push(bullet);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key == 'f') {
    figure.fadeToAction('Idle', 0.5);
  }
});






let idleTimeline = gsap.timeline();
idleTimeline.to(figure.params, {
  repeat: -1,
  yoyo: true,
  duration: 1,
  delay: 2.5,
  ease: "power1.inOut"

});
idleTimeline.to(figure.params, {
  repeat: -1,
  yoyo: true,
  duration: 0.2,
  ease: "power1.inOut"
}, ">2.2");

// Main loop
gsap.ticker.add(() => {
  axesHelper.visible = params.showHelpers;
  dlHelper.visible = params.showHelpers;
  camHelper.visible = params.showHelpers;
  gridHelper.visible = params.showHelpers;

  if ((idleTimeline.isActive() == false) && (jumpTimeline.isActive() == false) && (walkTimeline.isActive() == false)) {
    idleTimeline.restart();
  }

  if ((walkSpeed >= 0.01) && (!walkTimeline.isActive())) {
    walkTimeline.restart();
    idleTimeline.pause(0);
  }

  if (leftKeyIsDown) {
    rySpeed += 0.005;
  }
  if (rightKeyIsDown) {
    rySpeed -= 0.005;
  }
  if (upKeyIsDown) {
    walkSpeed += 0.05;
  }
  if (downKeyIsDown) {
    walkSpeed -= 0.01;
  }

  figure.params.ry += rySpeed;
  rySpeed *= 0.96;

  figure.params.x = figure.params.x + walkSpeed * Math.sin(figure.params.ry)
  figure.params.z = figure.params.z + walkSpeed * Math.cos(figure.params.ry)
  walkSpeed *= 0.9;

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].isAlive()) {
      bullets[i].update();
    }
    else {
      bullets.splice(i, 1);
      scene.remove(bullets[i]);
    }
  }

  const localCameraPosition = new THREE.Vector3(0, 5, -25);
  figure.localToWorld(localCameraPosition);
  camera.position.copy(localCameraPosition);

  camera.lookAt(new THREE.Vector3(figure.position.x, figure.position.y + 5, figure.position.z));  

  camera.updateProjectionMatrix();

  if(text){
    const localTextPosition = new THREE.Vector3(-2, 5, -20);
    const textPosition = camera.localToWorld(localTextPosition);
    text.lookAt(camera.position);
    text.position.copy(textPosition);
  }


  figure.update(0.01);
  //controls.update();
  stats.update();
  renderer.render(scene, camera);
});


