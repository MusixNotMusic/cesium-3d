import * as Cesium from 'cesium';
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
    // let InterPoints = getInterPointASegmentIntersectionCircle(center, R, pointA, pointB, GateSizeOfReflectivity / density);
    // test
    // let result = new Cesium.Cartesian3()
    // let _pointA = new Cesium.Cartesian3(pointA[0], pointA[1], pointA[2])
    // let _pointB = new Cesium.Cartesian3(pointB[0], pointB[1], pointB[2])
    // let interPoints2 = Cesium.Cartesian3.lerp(_pointA, _pointB, 0.1, result);
    // console.log('Cesium.Cartesian3.lerp ==》', _pointA, _pointB, result)
    let InterPoints = interTwoPoints(pointA, pointB, GateSizeOfReflectivity, R, density);
    console.log('Cesium.Cartesian3.lerp ==》', pointA, pointB, InterPoints)
    let Gates = R / GateSizeOfReflectivity + 1;
    let polars = []
    let base = []
    if (InterPoints) {
      let _center = new Cesium.Cartesian3(center[0], center[1], center[2])
      window._center = _center;
      InterPoints.forEach(point => {
          let _point = new Cesium.Cartesian3(point[0], point[1], point[2])
          let degree = vectorDegree(center, point)
          let _dis = getGeodesicDistance(_center, _point);
          // base.push({ azIndex: degree, binIndex: _dis / GateSizeOfReflectivity, dis: _dis / 1000 })
          // var point1cartographic = Cesium.Cartographic.fromCartesian(_center);
          // var point2cartographic = Cesium.Cartographic.fromCartesian(_point);
          // getTerrainDistance(point1cartographic, point2cartographic).then((_dis) => {
          //    console.log('_dis ==>', _dis)
          //    base.push({ azIndex: degree, binIndex: _dis / GateSizeOfReflectivity, dis: _dis / GateSizeOfReflectivity });
          // });
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
  // 截取最远点
  // if (actualDistance > R) {
  //   _pointB = Cesium.Cartesian3.lerp(_pointA, _pointB, R / actualDistance, result);
  // }
  let surfaceDis = Math.min(actualDistance, R);
  let len = surfaceDis / deltaDis * density;
  let upLen = Math.ceil(len);
  let interpArr = [];
  for (let i = 0; i < upLen; i++) {
    let interPoints = Cesium.Cartesian3.lerp(_pointA, _pointB, i > len ? 1 : i / upLen, result);
    // interpArr.push(interPoints);
    interpArr.push([interPoints.x, interPoints.y, interPoints.z]);
  }
  return interpArr;
}

export function getInterPointASegmentIntersectionCircle(center, R, pointA, pointB, _distance) {
    let crossPoints = validPoints(center, R, pointA, pointB)
    if (crossPoints) {
      return interpolationSegment(crossPoints[0], crossPoints[1], _distance)
    } 
    return null
 }

 function interpolationSegment (pointA, pointB, dist) {
    let k = getALineK(pointA, pointB)
    let resultPoint = []
    if (Math.abs(k) === Infinity) {
      let y1 = pointA[1];
      let y2 = pointB[1];
      let x =  pointA[0];
      let max = Math.max(y1, y2);
      let min = Math.min(y1, y2);
      for (let y = min; y <= max; y += dist) {
        resultPoint.push([x, y]);
      }
    } else if (Math.abs(k) === 0) {
      let x1 = pointA[0];
      let x2 = pointB[0];
      let y =  pointA[1];
      let max = Math.max(x1, x2);
      let min = Math.min(x1, x2);
      for (let x = min; x <= max; x += dist) {
        resultPoint.push([x, y]);
      }
    } else {
      let max, min;
      if(pointA[0] < pointB[0]) {
        max = pointB;
        min = pointA;
      } else {
        max = pointA;
        min = pointB;
      }
      let pointDis = distance(pointA, pointB);
      let step = pointDis / dist;
      let dx = (max[0] - min[0]) / step;
      for (let i = 0; i <= step; i++) {
        resultPoint.push([min[0] + i * dx, min[1] + i * dx * k]);
      }
    }
    return resultPoint;
 }


  function getALineK(pointA, pointB) {
    let x1 = pointA[0]
    let y1 = pointA[1]
    let x2 = pointB[0]
    let y2 = pointB[1]
    return (y2 - y1) / (x2 - x1)
  }


  /**
 * 获取线段与圆相交 有效交点
 * @param {*} R 
 * @param {*} center 
 * @param {*} pointA 
 * @param {*} pointB 
 */

 function validPoints1(center, R, pointA, pointB) {
    // center 垂直 A, B  线段是否 与圆相交
    let interPoints = circleLineIntersection(center, R, pointA, pointB)
    if (interPoints.length < 2) {
      return null
    } else {
      let innerPointA = isInside(R, center, pointA)  
      let innerPointB = isInside(R, center, pointB)
      if (!innerPointA && !innerPointB) {
        // minX <= interX <= maxX  且 minY <= interY <= minY
        if (inSquareArea(pointA, pointB, interPoints[0])) {
          return interPoints
        } else {
          return null
        }
      } else if(innerPointA && !innerPointB){
        /**
         * |xB - Ix1| < |xB - Ix2|
         * b点距离 交点I1 更短
         */
        if (Math.abs(pointB[0] - interPoints[0][0]) < Math.abs(pointB[0] - interPoints[1][0])) {
          return [pointA, interPoints[0]]
        } else {
          return [pointA, interPoints[1]]
        }
      } else if(!innerPointA && innerPointB){
        /**
         * |xA - Ix1| < |xA - Ix2|
         * b点距离 交点I1 更短
         */
        if (Math.abs(pointA[0] - interPoints[0][0]) < Math.abs(pointA[0] - interPoints[1][0])) {
          return [interPoints[0], pointB]
        } else {
          return [interPoints[1], pointB]
        }
      } else if(innerPointA && innerPointB){
        return [pointA, pointB]
      }
    }
  }


  /**
 * 获取线段与圆相交 有效交点
 * @param {*} R 
 * @param {*} center 
 * @param {*} pointA 
 * @param {*} pointB 
 */

 function validPoints(center, R, pointA, pointB) {
    // center 垂直 A, B  线段是否 与圆相交
    let interPoints = circleLineIntersection(center, R, pointA, pointB)
    if (interPoints.length < 2) {
      return null
    } else {
      let innerPointA = isInside(R, center, pointA)  
      let innerPointB = isInside(R, center, pointB)
      if (!innerPointA && !innerPointB) {
        // minX <= interX <= maxX  且 minY <= interY <= minY
        if (inSquareArea(pointA, pointB, interPoints[0])) {
          return interPoints
        } else {
          return null
        }
      } else if(innerPointA && !innerPointB){
        /**
         * |xB - Ix1| < |xB - Ix2|
         * b点距离 交点I1 更短
         */
        if (Math.abs(pointB[0] - interPoints[0][0]) < Math.abs(pointB[0] - interPoints[1][0])) {
          return [pointA, interPoints[0]]
        } else {
          return [pointA, interPoints[1]]
        }
      } else if(!innerPointA && innerPointB){
        /**
         * |xA - Ix1| < |xA - Ix2|
         * b点距离 交点I1 更短
         */
        if (Math.abs(pointA[0] - interPoints[0][0]) < Math.abs(pointA[0] - interPoints[1][0])) {
          return [interPoints[0], pointB]
        } else {
          return [interPoints[1], pointB]
        }
      } else if(innerPointA && innerPointB){
        return [pointA, pointB]
      }
    }
  }


  function circleLineIntersection(center, R, pointA, pointB) {
    let params = line(pointA, pointB)
    let cx = center[0]
    let cy = center[1]
    // console.log('params', params)
    if (params.k !== Infinity) {
      let points = findCircleLineIntersections(R, cx, cy, params.k, params.b)
      return points.map(x => [x, params.func(x)])
    // x = a
    } else {
      let x = pointA[0]
      if ( Math.abs(x - cx) < R) {
        // (x - cx) ^ 2 + (y - cy) ^ 2 = R ^ 2
        // +sqrt(R ^ 2 - (x - cx) ^ 2) + cy
        // part y = sqrt(R ^ 2 - (x - cx) ^ 2)
        let py = Math.sqrt(R ** 2 - (x - cx) ** 2)
        return [
          [x, py + cy],
          [x, -py + cy]
        ]
      } else {
        return []
      }
    }
  }


  /**
 * 计算2个点对应的 直线参数
 * y = k * x + b
 * @param {*} pointA 
 * @param {*} pointB 
 */
function line(pointA, pointB) {
    let x1 = pointA[0]
    let y1 = pointA[1]
    let x2 = pointB[0]
    let y2 = pointB[1]
  
    let k = (y2 - y1) / (x2 - x1)
  
    if (Math.abs(k) === Infinity) {
        return {k: Math.abs(k), b: Infinity, func: (x) => Infinity}
    } else if (k === 0) {
        return {k: 0, b: y1, func: (x) => y1}
    } else {
        // y = k(x - x1) + y1
        // y = kx - k * x1 + y1
        return { k: k, b: -k * x1 + y1, func: (x) => k * (x - x1) + y1 }
    }
  }


  /**
 * 判断一个点是否在 2个点 围成的 矩形内
 * @param {*} pointA 
 * @param {*} pointB 
 * @param {*} dot 
 * @returns 
 */
function inSquareArea (pointA, pointB, dot) {
    let maxX, minX, maxY, minY;
    let interP = dot;
    if (pointA[0] <= pointB[0]) {
      maxX = pointB[0]
      minX = pointA[0]
    } else {
      maxX = pointA[0]
      minX = pointB[0]
    }
  
    if (pointA[1] <= pointB[1]) {
      maxY = pointB[1]
      minY = pointA[1]
    } else {
      maxY = pointA[1]
      minY = pointB[1]
    }
    // minX <= interX <= maxX  且 minY <= interY <= minY
    return interP[0] <= maxX && interP[0] >= minX && interP[1] <= maxY && interP[1] >= minY
  }

  /**
 * https://cscheng.info/2016/06/09/calculate-circle-line-intersection-with-javascript-and-p5js.html
 * @param {*} r 
 * @param {*} h 
 * @param {*} k 
 * @param {*} m 
 * @param {*} n 
 * circle: (x - h)^2 + (y - k)^2 = r^2
 * line: y = m * x + n
 * r: circle radius
 * h: x value of circle centre
 * k: y value of circle centre
 * m: slope
 * n: y-intercept
 */

  function findCircleLineIntersections(r, h, k, m, n) {
    // circle: (x - h)^2 + (y - k)^2 = r^2
    // line: y = m * x + n
    // r: circle radius
    // h: x value of circle centre
    // k: y value of circle centre
    // m: slope
    // n: y-intercept
  
    var sq = x => x ** 2
    var sqrt = Math.sqrt
  
    // get a, b, c values
    var a = 1 + sq(m);
    var b = -h * 2 + (m * (n - k)) * 2;
    var c = sq(h) + sq(n - k) - sq(r);
  
    // get discriminant
    var d = sq(b) - 4 * a * c;
    if (d >= 0) {
        // insert into quadratic formula
        var intersections = [
            (-b + sqrt(sq(b) - 4 * a * c)) / (2 * a),
            (-b - sqrt(sq(b) - 4 * a * c)) / (2 * a)
        ];
        if (d == 0) {
            // only 1 intersection
            return [intersections[0]];
        }
        return intersections;
    }
    // no intersection
    return [];
  }

function distance(pointA, pointB) {
    return Math.sqrt((pointA[0] - pointB[0]) ** 2 + (pointA[1] - pointB[1]) ** 2)
}

function isInside(R, pointA, pointB) {
    return R >= distance(pointA, pointB)
}

/**
 * 
 * @param pointA 
 * @param pointB 
 * @description 2点夹角
 */
 export function vectorDegree (pointA, pointB) {
    var dy = pointB[1] - pointA[1];
    var dx = pointB[0] - pointA[0];
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
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

function getSurfaceDistance (pointOne, pointTwo) {
    var geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(pointOne, pointTwo);
    var distance = geodesic.surfaceDistance;
    return distance;
}