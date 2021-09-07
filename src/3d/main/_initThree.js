import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'

let ThreeContainer = document.getElementById('ThreeContainer');
let three = {
    renderer: null,
    camera: null,
    scene: null,
    stats: null
}

export function initThree() {
    var fov = 45;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var aspect = width / height;
    var near = 10;
    var far = 10 * 1000 * 1000; // needs to be far to support Cesium's world-scale rendering
  
    three.scene = new THREE.Scene();
    three.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    three.renderer = new THREE.WebGLRenderer({ alpha: true });
    ThreeContainer.appendChild(three.renderer.domElement);
    three.stats = new Stats();
    ThreeContainer.append(three.stats.dom);

    MeteoInstance.three = three;
  }