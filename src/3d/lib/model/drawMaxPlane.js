import * as THREE from 'three';
import { DragObjects } from './event/drag';
import * as Cesium from 'cesium';

let scale = 500; // 700
export function drawMaxPlane(data) {

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

  new DragObjects(meshMoveNS);
  // demo()

  // addListenerHandle();
  return {
    top: meshTopGroup,
    ns: meshNSGroup,
    we: meshWEGroup,
    moveNs: meshMoveNSGroup
  };
}


function addListenerHandle() {
  window.addEventListener('click', onMouseDown );
  window.addEventListener('mousemove', onMouseMove );
  window.addEventListener('mouseup', onMouseUp );
	// window.addEventListener( 'keydown', onKeyDown );
	// window.addEventListener( 'keyup', onKeyUp );
}


function removeListenerHandle() {
  window.removeEventListener( 'click', onMouseDown );
  window.removeEventListener( 'mousemove', onMouseMove );
  window.removeEventListener( 'mouseup', onMouseUp );
	// window.removeEventListener( 'keydown' );
	// window.removeEventListener( 'keyup' );
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
  targetObject = null;
  MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableRotate  = !enableSelection;
  // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTranslate = !enableSelection;
  // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableZoom = !enableSelection;
  // MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableTilt = !enableSelection;
}

function pauseEvent(e){
  if(e.stopPropagation) e.stopPropagation();
  if(e.preventDefault) e.preventDefault();
  e.cancelBubble=true;
  e.returnValue=false;
  return false;
}


function onMouseDown( event ) {
  console.log('onMouseDown');
  // pauseEvent(event);
  event.preventDefault();

  let camera = MeteoInstance.three.camera;
  let scene = MeteoInstance.three.scene;

  let viewer = MeteoInstance.cesium.viewer;

  // if ( enableSelection === true ) {

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

    if (targetObject) {
      enableSelection = true
      MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableRotate  = !enableSelection;
    }

  // }
}

function onMouseMove (event) {
  console.log('onMouseDown');
  event.preventDefault();
    if (targetObject && enableSelection) {
      let viewer = MeteoInstance.cesium.viewer;
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      let position = { x: mouse.x, y: mouse.y }; 
      let ray = viewer.camera.getPickRay(position);
      cartesian2 = viewer.scene.globe.pick(ray, viewer.scene);
      console.log('onMouseMove =>', cartesian1, cartesian2, targetObject);
      if (cartesian2 && cartesian1) {
        targetObject.position.y = (cartesian1.y - cartesian2.y) * scale;
      }
    }
  }

  function onMouseUp (event) {
    event.preventDefault();
    console.log('onMouseUp');
    enableSelection = false;
    targetObject = null;
    MeteoInstance.cesium.viewer.scene.screenSpaceCameraController.enableRotate  = !enableSelection;
  }


  function demo () {
  //   var viewer = new Cesium.Viewer('cesiumContainer',{
  //     sceneMode: 2,
  // });
  var viewer = MeteoInstance.cesium.viewer;
  viewer.entities.add({
      id:'id',
    position : Cesium.Cartesian3.fromDegrees(108.065735, 30.659462),
    billboard :{
        image : '/assets/img/logo.png'
    }
  });viewer.entities.add({
      id:'id2',
    position : Cesium.Cartesian3.fromDegrees(104.065735, 34.659462),
    billboard :{
        image : '/assets/img/logo.png'
    }
  });
  var  pointDraged = null;
  var  leftDownFlag=false;
  viewer.screenSpaceEventHandler.setInputAction(leftDownAction, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  viewer.screenSpaceEventHandler.setInputAction(leftUpAction, Cesium.ScreenSpaceEventType.LEFT_UP);
  viewer.screenSpaceEventHandler.setInputAction(mouseMoveAction, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  function leftDownAction(e) {
    console.log("左键按下");
    var  windowPosition = e.position;
    pointDraged = viewer.scene.pick(windowPosition);//选取当前的entity
    leftDownFlag = true;
    if (pointDraged) {
      // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
      viewer.scene.screenSpaceCameraController.enableTranslate = false;//锁定相机
      viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
    }
  }
  function leftUpAction(e) {
    console.log("左键抬起");
    leftDownFlag = false;
    pointDraged=null;
    viewer.scene.screenSpaceCameraController.enableTranslate = true;//解锁相机
    viewer.scene.screenSpaceCameraController.enableRotate = true;//锁定相机

  }
  function mouseMoveAction(e) {
    if (leftDownFlag === true && pointDraged) {
      console.log("鼠标移动");
      var cartesian = viewer.scene.camera.pickEllipsoid(e.endPosition, viewer.scene.globe.ellipsoid); 
      console.log(cartesian,pointDraged.id.position);
      if (cartesian) {
          pointDraged.id.position = new Cesium.CallbackProperty(function () {
              return cartesian;
          }, false);

      }
    }
  }
}
