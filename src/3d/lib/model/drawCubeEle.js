import * as THREE from 'three';
import { computeCubeMain } from './compute/computeCube';

export function drawCubeMesh(data) {
  let { vertices, colors } = computeCubeMain(data);
  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(colors, 3)
  );
  var material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    vertexColors: true,
    opacity: 0.3,
    transparent: true,
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  mesh.rotation.y = Math.PI;
  var cubeGroup = new THREE.Group();
  cubeGroup.add(mesh);
  return cubeGroup;
}