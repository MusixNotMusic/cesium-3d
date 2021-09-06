import * as THREE from 'three';
import { computePointsAndColors } from './compute/computeFaceVerticesAndColors';

export function drawFaceMesh(data) {
  let { vertices, colors, normals, indices } = computePointsAndColors(data);
  console.log('drawFaceMesh ==>', vertices);
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  //
  const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    vertexColors: true,
    opacity: 0.3
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.y = Math.PI;
  var meshGroup = new THREE.Group();
  meshGroup.add(mesh);
  return meshGroup;
}