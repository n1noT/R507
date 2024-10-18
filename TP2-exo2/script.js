
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import Mass from './Mass.js';
import Spring from './Spring.js';



// Create the scene
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

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

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);


const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
    -5, 5, -5,
    5, 5, -5,
    5, 15, -5,
    -5, 15, -5,
    -5, 5, 5,
    5, 5, 5,
    5, 15, 5,
    -5, 15, 5,
]);
const indices = [
    2, 1, 0, 0, 3, 2,
    0, 4, 7, 7, 3, 0,
    0, 1, 5, 5, 4, 0,
    1, 2, 6, 6, 5, 1,
    2, 3, 7, 7, 6, 2,
    4, 5, 6, 6, 7, 4
];
geometry.setIndex(indices);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

const material = new THREE.MeshPhongMaterial({ color: 0x1526213, emissive: 0x072534, flatShading: true, side: THREE.DoubleSide });

let mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
scene.add(mesh);

let masses = [];

for (let i = 0; i < vertices.length; i += 3) {
    masses.push(new Mass(vertices[i], vertices[i + 1], vertices[i + 2]));
}

let springs = [];
for (let i = 0; i < masses.length; i += 1) {
    for (let j = i + 1; j < masses.length; j++) {
        springs.push(new Spring(masses[i], masses[j]));
    }
}

document.addEventListener('keydown', (event) => {
    if(event.key === ' '){
        for(let m of masses){
            let dir = new THREE.Vector3(0, 30.0, 0);
            m.velocity.add(dir);
        }
    }
    if(event.key === 'z'){
        for(let m of masses){
            let dir = new THREE.Vector3(0, 0.0, -10);
            m.velocity.add(dir);
        }
    }
    if(event.key === 'q'){
        for(let m of masses){
            let dir = new THREE.Vector3(-10, 0.0, 0);
            m.velocity.add(dir);
        }
    }
    if(event.key === 's'){
        for(let m of masses){
            let dir = new THREE.Vector3(0, 0.0, 10);
            m.velocity.add(dir);
        }
    }
    if(event.key === 'd'){
        for(let m of masses){
            let dir = new THREE.Vector3(10, 0.0, 0);
            m.velocity.add(dir);
        }
    }
}
);          

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// Add a grid helper
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);
let clock = new THREE.Clock();

// Animation loop
gsap.ticker.add(() => {
        let deltaTime = clock.getDelta();

        for (let m of masses) {
            m.updatePosition(deltaTime);
        }
        for (let s of springs) {
            s.applyConstraint();
        }
        for (let s of springs) {
            s.avoidExchange();
        }

        let vertices = geometry.getAttribute('position').array;
        for(let i = 0; i < masses.length; i++){
            vertices[i * 3] = masses[i].position.x;
            vertices[i * 3 + 1] = masses[i].position.y;
            vertices[i * 3 + 2] = masses[i].position.z;
        }

        geometry.computeVertexNormals();
        geometry.getAttribute('position').needsUpdate = true;

        controls.update();
        renderer.render(scene, camera);
    }
);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});