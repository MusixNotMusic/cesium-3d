import * as Cesium from 'cesium';
import * as THREE from 'three';
/**
 *  计算极坐标 
 *     xz 平面 弧度交 xzRadian
 *     xz 平面 center 到 point 距离 distance       
 * @param {*} center 
 * @param {*} R 
 * @param {*} pointA 
 * @param {*} pointB 
 * @param {*} _distance 距离库 距离计算公式
 * @param {*} Elevations Array<Int> 仰角
 * @returns 
 */

 export function computeIntersectionSegmentCirclePolar (center, R, pointA, pointB, GateSizeOfReflectivity, density, Elevations, radarNf) {
    let InterPoints = interTwoPoints(pointA, pointB, GateSizeOfReflectivity, R, density);
    console.log('Cesium.Cartesian3.lerp ==》', pointA, pointB, InterPoints)
    let Gates = R / GateSizeOfReflectivity + 1;
    let polars = []
    let base = []
    if (InterPoints) {
      let _center = new Cesium.Cartesian3(center[0], center[1], center[2])
      window._center = _center;
      InterPoints.forEach(point => {
          let _point = new Cesium.Cartesian3(point[0], point[1], point[2]);
          let degree = getSpaceTwoPointDegree(_center, _point);
          let _dis = getGeodesicDistance(_center, _point);
          base.push({ azIndex: degree, binIndex: _dis / GateSizeOfReflectivity, dis: _dis })
      })
        console.log('base ==>', base)
        console.log('距离库 ==>', base[0].binIndex, base[base.length - 1].binIndex)
        console.log('距离 ==>', base[0].dis, base[base.length - 1].dis)
       
        let len = Elevations.length;
        let m = 0;
        for(let i = len - 1; i >= 0; i--, m++) {
            let ele = Elevations[i] / 180 * Math.PI;
            polars[m] = base.map(polarPoint => {
                let azIndex = polarPoint.azIndex;
                let binIndex = polarPoint.binIndex / Math.cos(ele);
                let val = binIndex > Gates ? 0 : radarNf.getOriginVal(i, azIndex | 0,  binIndex | 0).val;
                return { 
                  azIndex,
                  binIndex,
                  val: val || 0
                }
            })
        }
        return polars;
    } 
    return [];
}


/**
 *  计算 空间坐标 
 *     xz 平面 弧度交 xzRadian
 *     xz 平面 center 到 point 距离 distance       
 * @param {*} center 
 * @param {*} R 
 * @param {*} pointA 
 * @param {*} pointB 
 * @param {*} _distance 距离库 距离计算公式
 * @param {*} Elevations Array<Int> 仰角
 * @returns 
 */

 export function computeIntersectionSegmentCircleSpace (center, R, pointA, pointB, GateSizeOfReflectivity, density, Elevations, radarNf) {
  let InterPoints = interTwoPoints(pointA, pointB, GateSizeOfReflectivity, R, density);
  let Gates = R / GateSizeOfReflectivity + 1;
  let base = []
  let Colors = new THREE.Color();
  let vertices = [];
  let colors = [];
  let indices = [];
  let valMap = [];
  if (InterPoints) {
      let _center = new Cesium.Cartesian3(center[0], center[1], center[2])

      InterPoints.forEach(point => {
          let _point = new Cesium.Cartesian3(point[0], point[1], point[2]);
          let degree = getSpaceTwoPointDegree(_center, _point);
          let _dis = getGeodesicDistance(_center, _point);
          let vector = subractLocation(_point, _center);
          base.push({ azIndex: degree, binIndex: _dis / GateSizeOfReflectivity, distance: _dis, vector: vector });
      })

      console.log('base ==>', base)

      let len = Elevations.length;
      let baseLen = base.length;
      for(let i = 0; i < len; i++) {
          let ele = Elevations[i] / 180 * Math.PI;
          base.forEach((polarPoint, m) => {
              let azIndex = polarPoint.azIndex;
              let binIndex = polarPoint.binIndex / Math.cos(ele);
              let val = binIndex > Gates ? 0 : radarNf.getOriginVal(i, azIndex | 0,  binIndex | 0).val;
              valMap[i * baseLen + m] = val;
              // 颜色
              let rgb = Colors.setHex(MeteoInstance.colorCard[val | 0]);
              // 坐标
              let x = polarPoint.vector.x;
              let y = polarPoint.vector.y;
              // let z = polarPoint.vector.z + 2000 * i;
              let z = polarPoint.distance * Math.tan(ele) * 2;
              // let z = polarPoint.distance * Math.tan(ele);
              vertices.push(x, y, z);
              // normals.push(0, 1, 0)
              colors.push(rgb.r, rgb.g, rgb.b);
          })
      }

      for(let i = 0; i < len - 1; i++) { 
        for(let m = 0; m < baseLen - 1; m ++) {
          let bottom = m;
          let up = (i + 1) * baseLen + m;
         
          if (valMap[up + 1] > 0) {
            indices.push(bottom + 1, bottom, up + 1);
          }
          if (valMap[up] > 0 && valMap[up + 1] > 0) {
            indices.push(bottom, up, up + 1);
          }
          // indices.push(bottom + 1, bottom, up + 1);
          // indices.push(bottom, up, up + 1);
        }
      }
  } 
  // console.log('vertices ==>', vertices);
  // console.log('colors   ==>', colors);
  // console.log('indices  ==>', indices);
  // console.log('valMap  ==>', valMap);
  return {
    vertices,
    colors,
    indices,
    // normals
  };
}

/**
 * 2点之间 等距离插值
 * @param {*} pointA 
 * @param {*} pointB 
 * @param {*} deltaDis 
 * @param {*} density  取值密度
 * @param {*} R  插值半径
 * 
 * 
 */
export function interTwoPoints (pointA, pointB, deltaDis, R, density) {
  let _pointA = new Cesium.Cartesian3(pointA[0], pointA[1], pointA[2]);
  let _pointB = new Cesium.Cartesian3(pointB[0], pointB[1], pointB[2]);
  let result = new Cesium.Cartesian3();
  // 去最小值
  let actualDistance = getGeodesicDistance(_pointA, _pointB);
  let surfaceDis = Math.min(actualDistance, R);
  let len = surfaceDis / deltaDis * density;
  let upLen = Math.ceil(len);
  let interpArr = [];
  for (let i = 0; i < upLen; i++) {
    let interPoints = Cesium.Cartesian3.lerp(_pointA, _pointB, i > len ? 1 : i / upLen, result);
    interpArr.push([interPoints.x, interPoints.y, interPoints.z]);
  }
  return interpArr;
}


/**
 * 返回两点之间的测地距离。
 * @param {Cartesian3} pointOne 第一个坐标点
 * @param {Cartesian3} pointTwo 第二个坐标点
 * @returns {Number} 返回两点之间的测地距离。
 */

 function getGeodesicDistance (pointOne, pointTwo) {
    const { Ellipsoid, EllipsoidGeodesic } = Cesium
    const pickedPointCartographic = Ellipsoid.WGS84.cartesianToCartographic(
      pointOne
    );
    const lastPointCartographic = Ellipsoid.WGS84.cartesianToCartographic(
      pointTwo
    );
    const geodesic = new EllipsoidGeodesic(
      pickedPointCartographic,
      lastPointCartographic
    );
    return geodesic.surfaceDistance;
  }


  /**
   * 空间坐标 转 地理坐标
   */
  function cartesianToCartographic (x, y, z) {
    let viewer = MeteoInstance.cesium.viewer;
    let ellipsoid = viewer.scene.globe.ellipsoid;
    let cartesian3 = new Cesium.Cartesian3(x,y,z);
    let cartographic = ellipsoid.cartesianToCartographic(cartesian3);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    let lng = Cesium.Math.toDegrees(cartographic.longitude);
    let alt = cartographic.height;
    return {
        lng,
        lat,
        alt
    }
  }

  function getSpaceTwoPointDegree(center, point) {
    let centerCarto = cartesianToCartographic(center.x, center.y, center.z);
    let pointCarto  = cartesianToCartographic(point.x, point.y, point.z);
    let degree = courseAngle(centerCarto.lng, centerCarto.lat, pointCarto.lng, pointCarto.lat);
    return degree;
  }
  
/**
 * 计算a点和b点的角度
 * @param lng_a a点经度
 * @param lat_a a点维度
 * @param lng_b b点经度
 * @param lat_b b点维度
 * @returns 角度
 */
function courseAngle(lng_a, lat_a, lng_b, lat_b, clockwise) {
    //以a点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
    var localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(new Cesium.Cartesian3.fromDegrees(lng_a, lat_a));
    //求世界坐标到局部坐标的变换矩阵
    var worldToLocal_Matrix = Cesium.Matrix4.inverse(localToWorld_Matrix, new Cesium.Matrix4());    	
    //a点在局部坐标的位置，其实就是局部坐标原点
    var localPosition_A = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, new Cesium.Cartesian3.fromDegrees(lng_a, lat_a), new Cesium.Cartesian3());
    //B点在以A点为原点的局部的坐标位置
    var localPosition_B = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, new Cesium.Cartesian3.fromDegrees(lng_b, lat_b), new Cesium.Cartesian3());
    //弧度
    var angle = -Math.atan2((localPosition_B.y-localPosition_A.y), (localPosition_B.x-localPosition_A.x))
    //角度
    var theta = angle*(180/Math.PI);
    if (theta < 0) {
    	theta = theta + 360;
    }
    return theta;
}

/**
 * 计算a点和b点的 局部向量差
 * @param {*} center 
 * @param {*} point 
 * @returns 
 */
export function subractLocation(point, center) {
    //以a点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
    var localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    //求世界坐标到局部坐标的变换矩阵
    var worldToLocal_Matrix = Cesium.Matrix4.inverse(localToWorld_Matrix, new Cesium.Matrix4());    	
    //a点在局部坐标的位置，其实就是局部坐标原点
    var start = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, center, new Cesium.Cartesian3());
    //B点在以A点为原点的局部的坐标位置
    var end = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, point, new Cesium.Cartesian3());
    
    return Cesium.Cartesian3.subtract(start, end, new Cesium.Cartesian3());;
}


/**
 * 计算a点和b点的 局部向量差
 * @param {*} center 
 * @param {*} point 
 * @returns 
 */
 export function subractLocationFunc(center) {
  //以a点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
  var localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
  //求世界坐标到局部坐标的变换矩阵
  var worldToLocal_Matrix = Cesium.Matrix4.inverse(localToWorld_Matrix, new Cesium.Matrix4());    	
  //a点在局部坐标的位置，其实就是局部坐标原点
  var start = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, center, new Cesium.Cartesian3());
  //B点在以A点为原点的局部的坐标位置
  return function (point) {
    var end = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, point, new Cesium.Cartesian3());
    return Cesium.Cartesian3.subtract(end, start, new Cesium.Cartesian3());;
  }
}
