import * as THREE from 'three';

export default class Particle {

    constructor(_pos, _vel, _geo) {
        this.material = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x000000, specular: 0x111111, shininess: 30 });
        this.material.transparent = true;

        this.mesh = new THREE.Mesh(_geo, this.material);
        this.mesh.castShadow = true;
        let size = 0.3;
        this.mesh.scale.set(size, size, size);
        this.mesh.position.set(_pos.x, _pos.y, _pos.z);

        this.velocity = _vel;
        this.position = _vel;
        this.alpha = 255;
    }
  
    finished() {
        return this.alpha < 0;
    }
  
    update(dt) {
        this.mesh.position.add(this.velocity);
        this.alpha -= 5;
        this.material.opacity = this.alpha / 255;
    }

}

