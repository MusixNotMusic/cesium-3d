import * as Cesium from 'cesium';
import * as THREE from 'three';
import { loadPng } from '@/3d/lib/loadPngData';

import { initCesium } from './_initCesium';
import { initThree } from './_initThree';

import { Object3D, ObjectStore} from './objectStore'

import { drawCubeMesh } from '@/3d/lib/model/drawCubeEle';
import { drawFaceMesh } from '@/3d/lib/model/drawFaceEle';
import { drawPointsMesh } from '@/3d/lib/model/drawPointsEle';

let minWGS84 = [104.065735, 30.659462]
let maxWGS84 = [104.065735, 30.659462]


console.log('MeteoInstance ==>', MeteoInstance)

function main (data) {
  prepare();
  initCesium();
  initThree();
  buildModel(data);
  drawAssist();
  animation()
}

function prepare() {
  MeteoInstance.minWGS84 = minWGS84;
  MeteoInstance.maxWGS84 = maxWGS84;
  // 模型对象存储
  MeteoInstance.objectStore = [];
  // 模型存储 实例
  MeteoInstance.objectStoreIns = new ObjectStore();

  MeteoInstance.center = Cesium.Cartesian3.fromDegrees(
    (minWGS84[0] + maxWGS84[0]) / 2,
    (minWGS84[1] + maxWGS84[1]) / 2,
    100
  );
}


export function init() {
  loadPng().then((data) => {
    main(data)
  })
}


function buildModel(data) {
  //Three entity
  drawFace(data);
  // drawPoint(data);
}


function animation () {
  requestAnimationFrame(animation);
  renderCesium(MeteoInstance.cesium);
  // 视角对齐
  threeCesiumViewAlign( MeteoInstance.three,  MeteoInstance.cesium);
  MeteoInstance.three.stats.update();
}

/**
 * cesium
 * @param {*} cesium 
 */
function renderCesium(cesium) {
  cesium.viewer.render();
}

/**
 * threejs 与 cesium 视角对齐
 * @param {*} three 
 * @param {*} cesium 
 */
function threeCesiumViewAlign(three, cesium) {
  // register Three.js scene with Cesium
  three.camera.fov = Cesium.Math.toDegrees(cesium.viewer.camera.frustum.fovy); // ThreeJS FOV is vertical
  three.camera.updateProjectionMatrix();

  var cartToVec = function (cart) {
    return new THREE.Vector3(cart.x, cart.y, cart.z)
  };
  let objects3D = MeteoInstance.objectStore;
  // Configure Three.js meshes to stand against globe center position up direction
  objects3D.forEach((object) => {
    let minWGS84 = object.minWGS84;
    let maxWGS84 = object.maxWGS84;
    // convert lat/long center position to Cartesian3
    var center = Cesium.Cartesian3.fromDegrees(
      (minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2
    )

    // get forward direction for orienting model
    //   var centerHigh = Cesium.Cartesian3.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2, (minWGS84[1] + maxWGS84[1]) / 2, 1);
    var centerHigh = Cesium.Cartesian3.fromDegrees(
      (minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2,
      1
    );
    var centerHighNormal = cartToVec(centerHigh);
    // use direction from bottom left to top left as up-vector
    var bottomLeft = cartToVec(
      Cesium.Cartesian3.fromDegrees(minWGS84[0], minWGS84[1])
    );
    var topLeft = cartToVec(
      Cesium.Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1])
    );
    var latDir = new THREE.Vector3().subVectors(bottomLeft, topLeft).normalize();
    var centerNormal = cartToVec(center);

    // configure entity position and orientation
    object.threeMesh.position.copy(center);
    object.threeMesh.lookAt(centerHighNormal);
    //   _3Dobjects[id].threeMesh.up.copy(latDir);
    object.threeMesh.up.copy(centerNormal);
  })

  // Clone Cesium Camera projection position so the
  // Three.js Object will appear to be at the same place as above the Cesium Globe
  three.camera.matrixAutoUpdate = false;
  var cvm = cesium.viewer.camera.viewMatrix;
  var civm = cesium.viewer.camera.inverseViewMatrix;
  three.camera.lookAt(new THREE.Vector3(0, 1, 1));
  three.camera.matrixWorld.set(
    civm[0], civm[4], civm[8], civm[12],
    civm[1], civm[5], civm[9], civm[13],
    civm[2], civm[6], civm[10], civm[14],
    civm[3], civm[7], civm[11], civm[15]
  );
  three.camera.matrixWorldInverse.set(
    cvm[0], cvm[4], cvm[8], cvm[12],
    cvm[1], cvm[5], cvm[9], cvm[13],
    cvm[2], cvm[6], cvm[10], cvm[14],
    cvm[3], cvm[7], cvm[11], cvm[15]
  );
  // three.camera.lookAt(new THREE.Vector3(0,0,0));

  var width = ThreeContainer.clientWidth;
  var height = ThreeContainer.clientHeight;
  var aspect = width / height;
  three.camera.aspect = aspect;
  three.camera.updateProjectionMatrix();

  three.renderer.setSize(width, height);
  three.renderer.render(three.scene, three.camera);
}


function drawPoint(data) {
  let objectStoreIns = MeteoInstance.objectStoreIns;
  let pointsMesh = drawPointsMesh(data)
  MeteoInstance.three.scene.add(pointsMesh);
  objectStoreIns.push(new Object3D(pointsMesh, minWGS84, maxWGS84))
}

function drawFace(data) {
  let objectStoreIns = MeteoInstance.objectStoreIns;
  let faceMesh = drawFaceMesh(data);
  MeteoInstance.three.scene.add(faceMesh);
  objectStoreIns.push(new Object3D(faceMesh, minWGS84, maxWGS84));
}

function drawAssist() {
  let objectStoreIns = MeteoInstance.objectStoreIns;
  // axesHelper
  let axesHelper = new THREE.AxesHelper(1e5 * 2)
  axesHelper.rotation.x = Math.PI / 2
  axesHelper.rotation.y = Math.PI
  var axesHelperGroup = new THREE.Group()
  axesHelperGroup.add(axesHelper)
  MeteoInstance.three.scene.add(axesHelperGroup)

  var _3DOB = new Object3D(axesHelperGroup, minWGS84, maxWGS84)
  objectStoreIns.push(_3DOB)

  // axesHelper
  let gridHelper = new THREE.GridHelper(1e5 * 3, 50)
  gridHelper.rotation.x = Math.PI / 2
  gridHelper.rotation.y = Math.PI
  var axesGridHelper = new THREE.Group()
  axesGridHelper.add(gridHelper)
  MeteoInstance.three.scene.add(axesGridHelper)

  var _3DOB = new Object3D(axesGridHelper, minWGS84, maxWGS84)
  objectStoreIns.push(_3DOB)
}

function drawCube(data) {
  let objectStoreIns = MeteoInstance.objectStoreIns;
  let cubeMesh = drawCubeMesh(data);
  MeteoInstance.three.scene.add(cubeMesh);
  objectStoreIns.push(new Object3D(cubeMesh, minWGS84, maxWGS84));
}



