import * as THREE from 'three';

export function drawGround() {
  const geometry = new THREE.PlaneGeometry( 350000, 350000 );
  const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.1} );
  const plane = new THREE.Mesh( geometry, material );
  plane.name = 'ground';
  // plane.rotation.x = Math.PI / 2;
  // plane.rotation.y = Math.PI;

    
  var planeGroup = new THREE.Group();
  // planeGroup.name = 'ground';
  planeGroup.add(plane);
  return planeGroup; // don’t forget to add it to the Three.js scene manually
}