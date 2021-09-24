import * as THREE from 'three';

export function drawGround() {
  const geometry = new THREE.PlaneGeometry( 1e6, 1e6 );
  const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  const plane = new THREE.Mesh( geometry, material );
    
  // plane.rotation.x = Math.PI / 2;
  // plane.rotation.y = Math.PI;
    
  var planeGroup = new THREE.Group();
  planeGroup.add(plane);
  return planeGroup; // don’t forget to add it to the Three.js scene manually
}