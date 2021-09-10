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

  const planeMoveNs = new THREE.PlaneGeometry(data.widthPixel * scale, data.heightPixel * scale);

  const materialTop = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const materialNS = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const materialWE = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });

  const materialMoveNS = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, color: '0xffffff', opacity: 0.3 });

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

  // move
  const meshMoveNS = new THREE.Mesh(planeMoveNs, materialMoveNS);
  meshMoveNS.position.z += data.heightPixel / 2 * scale;
  meshMoveNS.position.y += data.widthPixel / 2 * scale;
  meshMoveNS.rotation.x = Math.PI / 2;
  meshMoveNS.name = 'moveNs';
  // meshNS.rotation.y = Math.PI;
  var meshMoveNSGroup = new THREE.Group();
  meshMoveNSGroup.add(meshMoveNS);

  addListenerHandle();
  return {
    top: meshTopGroup,
    ns: meshNSGroup,
    we: meshWEGroup,
    moveNs: meshMoveNSGroup
  };
}


function addListenerHandle() {
  window.addEventListener("dragstart", (e) => {
    e.preventDefault();
    e.stopPropagation(); 
  });
  document.addEventListener('click', onMouseDown );
  document.addEventListener('mousemove', onMouseMove );
  document.addEventListener('mouseup', onMouseUp );
	window.addEventListener( 'keydown', onKeyDown );
	window.addEventListener( 'keyup', onKeyUp );
}

function removeListenerHandle() {
  document.removeEventListener( 'click', onMouseDown );
  document.removeEventListener( 'mousemove', onMouseMove );
  document.removeEventListener( 'mouseup', onMouseUp );
	window.removeEventListener( 'keydown' );
	window.removeEventListener( 'keyup' );
}

let enableSelection = false;
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let targetObject = null;
let cartesian1;
let cartesian2;

function onKeyDown( event ) {
  // shift
  // enableSelection = ( event.keyCode === 16 ) ? true : false;
  enableSelection = ( event.keyCode === 18 ) ? true : false;

  MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableRotate  = !enableSelection;
  // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTranslate = !enableSelection;
  // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableZoom = !enableSelection;
  // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTilt = !enableSelection;
  
}

function onKeyUp() {

  enableSelection = false;

  MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableRotate  = !enableSelection;
  // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTranslate = !enableSelection;
  // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableZoom = !enableSelection;
  // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTilt = !enableSelection;
}



function onMouseDown( event ) {
  console.log('onMouseDown');

  event.preventDefault();

  let camera = MeteoInstance.three.camera;
  let scene = MeteoInstance.three.scene;

  let viewer = MeteoInstance.cesium.viewer;

  if ( enableSelection === true ) {

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    let position = { x: mouse.x, y: mouse.y }; 
    let ray = viewer.camera.getPickRay(position);
    cartesian1 = viewer.scene.globe.pick(ray, viewer.scene);
    console.log('cartesian1 ==>', cartesian1, mouse, event)
    raycaster.setFromCamera( mouse, camera );

    const intersections = raycaster.intersectObjects( scene.children, true );

    if ( intersections.length > 0 ) {
      console.log('intersections ==>', intersections);

      // const object = intersections[ 0 ].object;

      let len = intersections.length;
      for (let i = 0; i < len; i++) {
        const object = intersections[ i ].object;
        if (object.name === 'moveNs') {
          targetObject = object;
          break;
        }
      }
    }

  }
}

function onMouseMove (event) {
  if (targetObject && enableSelection) {
    console.log('onMouseMove');
    let viewer = MeteoInstance.cesium.viewer;
    let scene = MeteoInstance.three.scene;
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    let position = { x: mouse.x, y: mouse.y }; 
    let ray = viewer.camera.getPickRay(position);
    cartesian2 = viewer.scene.globe.pick(ray, viewer.scene);
    console.log('onMouseMove =>', cartesian2, targetObject, targetObject.parent.up.y);
    if (cartesian2 && cartesian1) {
      targetObject.position.y += cartesian2.y - cartesian1.y
    }
  }
}

function onMouseUp (event) {
  console.log('onMouseUp');
  
  targetObject = null;
}