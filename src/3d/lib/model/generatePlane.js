import * as THREE from 'three'

export function generatePlane (height) {
    // mesh panel
    let vetices = [
        1, 0, 1, 
        1, height, 1, 
        0, 0, 1, 
        0, 0, 1, 
        0, height, 1, 
        1, height, 1 
    ]
    let colors = [
        Math.random(), 
        Math.random(), 
        Math.random(), 

        Math.random(), 
        Math.random(), 
        Math.random(), 
        
        Math.random(), 
        Math.random(), 
        Math.random(), 
        
        Math.random(), 
        Math.random(), 
        Math.random(), 
        
        Math.random(), 
        Math.random(), 
        Math.random(), 
        
        Math.random(), 
        Math.random(), 
        Math.random()
    ]
    const geometry3 = new THREE.BufferGeometry();
    geometry3.setAttribute( 'position', new THREE.Float32BufferAttribute( vetices, 3 ) );
    geometry3.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    // geometry3.computeBoundingSphere();
    //
    const material3 = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, vertexColors: true} );

    let meshPlane = new THREE.Mesh( geometry3, material3 );
    return meshPlane;
}