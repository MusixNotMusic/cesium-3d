import * as THREE from 'three';
import { computeExtrusionPointsAndColors } from './compute/computeExtrusionFace';
import { computeExtrusionCubeAndColors } from './compute/computeExtrusionCube';

export function drawExtrusionMesh(data) {
  let { vertices, colors, indices } = computeExtrusionPointsAndColors(data);
  // let { vertices, colors, indices } = computeExtrusionCubeAndColors(data);

  console.log(vertices, colors, indices)

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  geometry.computeBoundingSphere();
 
  const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    vertexColors: true,
    transparent: false,
    // depthTest: false
  });
 
  const mesh = new THREE.Mesh(geometry, material);
  // mesh.rotation.x = Math.PI / 2;
  // mesh.rotation.y = Math.PI;
 
  var meshGroup = new THREE.Group();
  meshGroup.add(mesh);

  return meshGroup;
}
