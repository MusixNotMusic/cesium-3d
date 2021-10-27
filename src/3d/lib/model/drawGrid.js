import * as THREE from 'three';

export function drawGridMesh(data) {
    let { vertices, colors } = data.computeGridSpaceData();
    // console.log('drawGrid ==>', vertices, colors)
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
    // geometry.computeBoundingSphere();
    //
    const material = new THREE.PointsMaterial({ size: 20, vertexColors: true, transparent: true, opacity: 0.4 });
  
    var points = new THREE.Points(geometry, material);
    
    // points.rotation.x = Math.PI / 2;
    // points.rotation.y = Math.PI;
    
    var pointsGroup = new THREE.Group();
    pointsGroup.add(points);
    return pointsGroup; // don’t forget to add it to the Three.js scene manually
}