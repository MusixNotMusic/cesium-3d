/**
 *  计算 直线与圆交点的直线
 *  偏移角 1度相交点
 */

export function computeAcrossDescartesXYZ(center, R, pointA, pointB) {
  let degreeA = vectorDegree(center, pointA)
  let degreeB = vectorDegree(center, pointB)

  let aIsOutside = !isInside(R, center, pointA)
  let bIsOutside = !isInside(R, center, pointB)
  let pointV = verticalIntersection(pointA, pointB, center)
  let dvA = distance(pointA, pointV)
  let dvB = distance(pointB, pointV)
  let dAB = distance(pointA, pointB)
  // 判断 A B 两点都在圆外 垂直点是否在 直线上
  let onLine = true
  if (aIsOutside && bIsOutside) {
    onLine = dvA <= dAB && dvB <= dAB
  }
  console.log('degreeA ==>', degreeA, degreeB, pointV)
  let points = []
  // 交点在圆内
  if (isInside(R, pointV, center) && onLine) {
    /**
     * |B - A| > 180
     */
    if (Math.abs(degreeA - degreeB) > 180) {
      if (degreeA > degreeB) {
        degreeB += 360
      } else {
        degreeA += 360
      }
    }
    if (degreeA <= degreeB) {
      let temp = degreeA
      degreeA = degreeB
      degreeB = temp
    }
    for (let d = degreeB; d < degreeA; d += 0.3) {
      let _point = getPointFromLine(d, center)
      let pointR = intersection(pointA, pointB, _point, center)
      if (distance(pointR, center) < R) {
        points.push(pointR)
      }
    }
  }
  return {
    points,
    pointV,
  }
}

/**
 *  计算极坐标
 *     xz 平面 弧度交 xzRadian
 *     xz 平面 center 到 point 距离 distance
 * @param {*} center
 * @param {*} R
 * @param {*} pointA
 * @param {*} pointB
 * @param {*} distanceComputeFuncs 距离计算公式
 * @returns
 */

export function computeAcrossPolar(
  center,
  R,
  pointA,
  pointB,
  distanceComputeFuncs
) {
  let degreeA = vectorDegree(center, pointA)
  let degreeB = vectorDegree(center, pointB)

  let aIsOutside = !isInside(R, center, pointA)
  let bIsOutside = !isInside(R, center, pointB)
  let pointV = verticalIntersection(pointA, pointB, center)
  let dvA = distance(pointA, pointV)
  let dvB = distance(pointB, pointV)
  let dAB = distance(pointA, pointB)
  // 判断 A B 两点都在圆外 垂直点是否在 直线上
  let onLine = true
  if (aIsOutside && bIsOutside) {
    onLine = dvA <= dAB && dvB <= dAB
  }
  let polarPoint = []
  // 交点在圆内
  if (isInside(R, pointV, center) && onLine) {
    /**
     * |B - A| > 180
     */
    if (Math.abs(degreeA - degreeB) > 180) {
      if (degreeA > degreeB) {
        degreeB += 360
      } else {
        degreeA += 360
      }
    }
    if (degreeA <= degreeB) {
      let temp = degreeA
      degreeA = degreeB
      degreeB = temp
    }
    if (degreeA !== degreeB) {
      // let diffD = computerDiffBetweenDegree(degreeA, degreeB)
      for (let d = degreeB; d < degreeA; d += 0.2) {
        let _point = getPointFromLine(d, center)
        let pointR = intersection(pointA, pointB, _point, center)
        let _computeDistance = distanceComputeFuncs || distance
        let _distance = _computeDistance(pointR, center)
        if (_distance < R) {
          polarPoint.push({
            distance: _distance,
            radian: d >= 360 ? d - 360 : d,
          })
        }
      }
    }
  }
  return {
    polarPoint,
    pointV,
  }
}

function computerDiffBetweenDegree(degreeA, degreeB) {
  return Math.abs(degreeB - degreeA) / 180
}

function getInterPointASegmentIntersectionCircle(
  center,
  R,
  pointA,
  pointB,
  _distance
) {
  let crossPoints = validPoints(center, R, pointA, pointB)
  if (crossPoints) {
    return interpolationSegment(crossPoints[0], crossPoints[1], _distance)
  }
  return null
}

function interpolationSegment(pointA, pointB, dist) {
  let k = getALineK(pointA, pointB)
  let resultPoint = []
  if (Math.abs(k) === Infinity) {
    let y1 = pointA[1]
    let y2 = pointB[1]
    let x = pointA[0]
    let max = Math.max(y1, y2)
    let min = Math.min(y1, y2)
    for (let y = min; y <= max; y += dist) {
      resultPoint.push([x, y])
    }
  } else if (Math.abs(k) === 0) {
    let x1 = pointA[0]
    let x2 = pointB[0]
    let y = pointA[1]
    let max = Math.max(x1, x2)
    let min = Math.min(x1, x2)
    for (let x = min; x <= max; x += dist) {
      resultPoint.push([x, y])
    }
  } else {
    let max, min
    if (pointA[0] < pointB[0]) {
      max = pointB
      min = pointA
    } else {
      max = pointA
      min = pointB
    }
    let pointDis = distance(pointA, pointB)
    let step = pointDis / dist
    let dx = (max[0] - min[0]) / step
    for (let i = 0; i <= step; i++) {
      resultPoint.push([min[0] + i * dx, min[1] + i * dx * k])
    }
  }
  return resultPoint
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
    } else if (innerPointA && !innerPointB) {
      /**
       * |xB - Ix1| < |xB - Ix2|
       * b点距离 交点I1 更短
       */
      if (
        Math.abs(pointB[0] - interPoints[0][0]) <
        Math.abs(pointB[0] - interPoints[1][0])
      ) {
        return [pointA, interPoints[0]]
      } else {
        return [pointA, interPoints[1]]
      }
    } else if (!innerPointA && innerPointB) {
      /**
       * |xA - Ix1| < |xA - Ix2|
       * b点距离 交点I1 更短
       */
      if (
        Math.abs(pointA[0] - interPoints[0][0]) <
        Math.abs(pointA[0] - interPoints[1][0])
      ) {
        return [interPoints[0], pointB]
      } else {
        return [interPoints[1], pointB]
      }
    } else if (innerPointA && innerPointB) {
      return [pointA, pointB]
    }
  }
}

function circleLineIntersection(center, R, pointA, pointB) {
  let params = line(pointA, pointB)
  let cx = center[0]
  let cy = center[1]
  if (params.k !== Infinity) {
    let points = findCircleLineIntersections(R, cx, cy, params.k, params.b)
    return points.map((x) => [x, params.func(x)])
    // x = a
  } else {
    let x = pointA[0]
    if (Math.abs(x - cx) < R) {
      let y = Math.sqrt(R ** 2 - (x - cx) ** 2) + cy
      return [
        [x, y],
        [x, -y],
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
    return { k: Math.abs(k), b: Infinity, func: (x) => Infinity }
  } else if (k === 0) {
    return { k: 0, b: y1, func: (x) => y1 }
  } else {
    // y = k(x - x1) + y1
    // y = kx - k * x1 + y1
    return { k: k, b: -k * x1 + y1, func: (x) => k * (x - x1) + y1 }
  }
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

  var sq = (x) => x ** 2
  var sqrt = Math.sqrt

  // get a, b, c values
  var a = 1 + sq(m)
  var b = -h * 2 + m * (n - k) * 2
  var c = sq(h) + sq(n - k) - sq(r)

  // get discriminant
  var d = sq(b) - 4 * a * c
  if (d >= 0) {
    // insert into quadratic formula
    var intersections = [
      (-b + sqrt(sq(b) - 4 * a * c)) / (2 * a),
      (-b - sqrt(sq(b) - 4 * a * c)) / (2 * a),
    ]
    if (d == 0) {
      // only 1 intersection
      return [intersections[0]]
    }
    return intersections
  }
  // no intersection
  return []
}

/**
 * 判断一个点是否在 2个点 围成的 矩形内
 *
 *      .(A)----------------
 *     /                   /
 *    /                   /  .(D) outside
 *   /       .(C) inside /
 *  /                   /
 * /___________________.(B)
 * @param {*} pointA
 * @param {*} pointB
 * @param {*} dot
 * @returns
 */
function inSquareArea(pointA, pointB, dot) {
  let maxX, minX, maxY, minY
  let interP = dot
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
  return (
    interP[0] <= maxX &&
    interP[0] >= minX &&
    interP[1] <= maxY &&
    interP[1] >= minY
  )
}

function getALineK(pointA, pointB) {
  let x1 = pointA[0]
  let y1 = pointA[1]
  let x2 = pointB[0]
  let y2 = pointB[1]
  return (y2 - y1) / (x2 - x1)
}

function isInside(R, pointA, pointB) {
  return R >= distance(pointA, pointB)
}

export function distance(pointA, pointB) {
  return Math.sqrt((pointA[0] - pointB[0]) ** 2 + (pointA[1] - pointB[1]) ** 2)
}

function degreeToRadian(degree) {
  return (degree / 180) * Math.PI
}

/**
 * 知道一个 偏移角，获得一条直线， 计算出 直线上 除了 centerPoint 之外的任意一个点
 * @param {*} alpha
 * @param {*} centerPoint
 */
function getPointFromLine(alpha, centerPoint) {
  let x1 = centerPoint[0]
  let y1 = centerPoint[1]

  if (alpha === 90 && alpha === 270) {
    return [x1, y1 + 1]
  } else {
    let k = Math.tan(degreeToRadian(alpha))
    return [x1 + 1, k + y1]
  }
}

/**
 * 一直线， 一个点 求这点对这条直线的垂直交点
 *       /
 *      /
 *     /
 *    /     . (point)
 *   /
 *  /
 * /
 * @param {*} pointA
 * @param {*} pointB
 * @param {*} center
 */
function verticalIntersection(pointA, pointB, center) {
  let x1 = pointA[0]
  let y1 = pointA[1]
  let x2 = pointB[0]
  let y2 = pointB[1]
  let cx = center[0]
  let cy = center[1]

  let k = (y2 - y1) / (x2 - x1)

  let rx, ry
  if (k === Infinity) {
    return [x1, cy]
  } else if (k === 0) {
    return [cx, y1]
  } else {
    rx = cx + 1
    ry = (-1 / k) * (rx - cx) + cy
    return intersection(pointA, pointB, [rx, ry], center)
  }
}

/**
 *
 * @param pointA
 * @param pointB
 * @description 向量角度
 */
function vectorDegree(pointA, pointB) {
  var dy = pointB[1] - pointA[1]
  var dx = pointB[0] - pointA[0]
  var theta = Math.atan2(dy, dx) // range (-PI, PI]
  theta *= 180 / Math.PI // rads to degs, range (-180, 180]
  if (theta < 0) theta = 360 + theta // range [0, 360)
  return theta
}

/**
 * https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
 * @param {*} line1Point1  line1
 * @param {*} line1Point2
 * @param {*} line2Point1  line2
 * @param {*} line2Point2
 */
function intersection(line1Point1, line1Point2, line2Point1, line2Point2) {
  let x1 = line1Point1[0]
  let y1 = line1Point1[1]

  let x2 = line1Point2[0]
  let y2 = line1Point2[1]

  let x3 = line2Point1[0]
  let y3 = line2Point1[1]

  let x4 = line2Point2[0]
  let y4 = line2Point2[1]

  let D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

  let px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / D
  let py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / D

  return [px, py]
}
