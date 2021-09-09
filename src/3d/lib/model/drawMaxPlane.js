import * as THREE from 'three';

export function drawMaxPlane(data) {
  let scale = 500; // 700

  let canvTop = data.toImageCanvas(data.DataTop, data.widthPixel, data.widthPixel); 
  let canvNS = data.toImageCanvas(data.DataNS, data.widthPixel, data.heightPixel, true);
  let canvWE = data.toRotationImageCanvas(data.DataWE, data.widthPixel, data.heightPixel, false);
//   let canvWE = data.toImageCanvas(data.DataWE, data.heightPixel, data.widthPixel, false);

  const planeTop = new THREE.PlaneGeometry(data.widthPixel * scale, data.widthPixel * scale);
  const planeNS = new THREE.PlaneGeometry(data.widthPixel * scale, data.heightPixel * scale);
  const planeWE = new THREE.PlaneGeometry(data.widthPixel * scale, data.heightPixel * scale);

  const materialTop = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const materialNS = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const materialWE = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });

  materialTop.map = new THREE.CanvasTexture( canvTop );
  materialNS.map = new THREE.CanvasTexture( canvNS );
  materialWE.map = new THREE.CanvasTexture( canvWE );

  materialTop.map.needsUpdate = true;
  materialNS.map.needsUpdate = true;
  materialWE.map.needsUpdate = true;
  //
//   const material = new THREE.MeshBasicMaterial({
//     side: THREE.DoubleSide,
//     vertexColors: true,
//     opacity: 0.3
//   });
  const meshTop = new THREE.Mesh(planeTop, materialTop);
  meshTop.rotation.x = Math.PI;
  meshTop.rotation.y = Math.PI;
  var meshTopGroup = new THREE.Group();
  meshTopGroup.add(meshTop);

  const meshNS = new THREE.Mesh(planeNS, materialNS);
  meshNS.rotation.x = Math.PI / 2;
  meshNS.rotation.y = Math.PI;
  meshNS.position.z += data.heightPixel / 2 * scale;
  meshNS.position.y -= data.widthPixel / 2 * scale;
  var meshNSGroup = new THREE.Group();
  meshNSGroup.add(meshNS);

  const meshWE = new THREE.Mesh(planeWE, materialWE);
  meshWE.rotation.x = Math.PI / 2;
  meshWE.rotation.y = Math.PI / 2;
  meshWE.position.z += data.heightPixel / 2 * scale;
  meshWE.position.x -= data.widthPixel / 2 * scale;
  var meshWEGroup = new THREE.Group();
  meshWEGroup.add(meshWE);

  return {
    top: meshTopGroup,
    ns: meshNSGroup,
    we: meshWEGroup
  };
}