import * as THREE from 'three'
import { triangulationTable, edgesTable } from '../../tables'

export function computeCubeMain(data) {
  // vertices
  let vertices = []
  const colors = []
  const color = new THREE.Color()

  let elevaLen = data.Header.ElevationCount
  let azimuthLen = 360
  let gateLen = data.Header.Gates[data.Header.BandNo]
  // let targetVals = [10, 40, 70, 110, 140, 170]
  let targetVals = [10, 70, 140]

  // 默认色卡
  // const colorCard = null;
  const colorCard = MeteoInstance.colorCard;

  // vertices
  for (let eleIndex = 0; eleIndex < elevaLen - 1; eleIndex++) {
    for (let azIndex = 0; azIndex < azimuthLen - 1; azIndex++) {
      for (let disIndex = 0; disIndex < gateLen - 1; disIndex++) {
        let pointIndexs = pointPosMap(eleIndex, azIndex, disIndex)
        let pv0 = data.getOriginVal(...pointIndexs[0]).val
        let pv1 = data.getOriginVal(...pointIndexs[1]).val
        let pv2 = data.getOriginVal(...pointIndexs[2]).val
        let pv3 = data.getOriginVal(...pointIndexs[3]).val
        let pv4 = data.getOriginVal(...pointIndexs[4]).val
        let pv5 = data.getOriginVal(...pointIndexs[5]).val
        let pv6 = data.getOriginVal(...pointIndexs[6]).val
        let pv7 = data.getOriginVal(...pointIndexs[7]).val
        let values = [pv0, pv1, pv2, pv3, pv4, pv5, pv6, pv7]
        for (let i = 0; i < targetVals.length; i++) {
          let targetVal = targetVals[i]
          // let targetVal = (pv2 / 10 | 0) * 10

          let state = getState(
            virtualRealNode(values[0], targetVal),
            virtualRealNode(values[1], targetVal),
            virtualRealNode(values[2], targetVal),
            virtualRealNode(values[3], targetVal),
            virtualRealNode(values[4], targetVal),
            virtualRealNode(values[5], targetVal),
            virtualRealNode(values[6], targetVal),
            virtualRealNode(values[7], targetVal)
          )
          if (triangulationTable[state] && state !== 0) {
            // coords
            let coords0 = data.polar2Cartesian(...pointIndexs[0])
            let coords1 = data.polar2Cartesian(...pointIndexs[1])
            let coords2 = data.polar2Cartesian(...pointIndexs[2])
            let coords3 = data.polar2Cartesian(...pointIndexs[3])
            let coords4 = data.polar2Cartesian(...pointIndexs[4])
            let coords5 = data.polar2Cartesian(...pointIndexs[5])
            let coords6 = data.polar2Cartesian(...pointIndexs[6])
            let coords7 = data.polar2Cartesian(...pointIndexs[7])

            // coordsArr.push(...coords0)
            // coordsArr.push(...coords1)
            // coordsArr.push(...coords2)
            // coordsArr.push(...coords3)
            // coordsArr.push(...coords4)
            // coordsArr.push(...coords5)
            // coordsArr.push(...coords6)
            // coordsArr.push(...coords7)

            let coords = [
              coords0,
              coords1,
              coords2,
              coords3,
              coords4,
              coords5,
              coords6,
              coords7,
            ]

            for (let edgeIndex of triangulationTable[state]) {
              if (edgeIndex !== -1) {
                let edgePos = edgesTable[edgeIndex]
                let points = calcPoints(
                  coords,
                  edgePos[0],
                  edgePos[1],
                  values,
                  edgePos[2],
                  edgePos[3],
                  targetVal
                )
                vertices.push(points[0], points[1], points[2])
                if (colorCard) {
                  color.setHex(colorCard[targetVal]);
                } else {
                  color.set(getColor(points[3]))
                }
                colors.push(color.r, color.g, color.b)
              }
            }
          }
        }
      }
    }
  }
  return {
    vertices,
    colors,
  }
}

// marching cubes use

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end
}

function getState(a, b, c, d, e, f, g, h) {
  return a * 1 + b * 2 + c * 4 + d * 8 + e * 16 + f * 32 + g * 64 + h * 128
}

/**
 *
 * @param {*} coords
 * @param {*} s
 * @param {*} e
 * @param {*} values
 * @param {*} sIndex
 * @param {*} eIndex
 * @returns
 */

function calcPoints(coords, s, e, values, sIndex, eIndex, targetVal) {
  let rate = (targetVal - values[sIndex]) / (values[eIndex] - values[sIndex])
  let x = lerp(coords[e][0], coords[s][0], rate)
  let y = lerp(coords[e][1], coords[s][1], rate)
  let z = lerp(coords[e][2], coords[s][2], rate)
  return [x, y, z, targetVal / 255]
}

/**
 * 判断虚实点
 */
function virtualRealNode(val, targetVal) {
  if (val <= targetVal) {
    return 0
  } else if (val > targetVal) {
    return 1
  }
}

function interColor(val) {
  val = val
  if (val <= 0) {
    return '#fff'
  } else if (val < 0.1) {
    return '#81b1db'
  } else if (val < 0.2) {
    return '#00aecd'
  } else if (val < 0.3) {
    return '#2ebaae'
  } else if (val < 0.4) {
    return '#e90'
  } else if (val < 0.5) {
    return '#009688'
  } else if (val < 0.6) {
    return '#3f51b5'
  } else if (val < 0.7) {
    return '#607d8b'
  } else if (val < 0.8) {
    return '#22ff4778'
  } else {
    return '#ff5722'
  }
}

// function getColor(val) {
//     let index = (val * 255) / 10 | 0
//     let colors = [
//         '#fff',
//         '#81b1db',
//         '#00aecd',
//         '#2ebaae',
//         '#7bd860',
//         '#009688',
//         '#3f51b5',
//         '#607d8b',
//         '#009999',
//         '#ff5722',
//         '#CCCC00',
//         '#f32d4e',
//         '#060760',
//         '#fd60f7',
//         '#f90d00',
//         '#1f0253',
//         '#218ca4',
//         '#1f2b56'
//     ]
//     return colors[index]
// }

function getColor(val) {
  let index = ((val * 255) / 20) | 0
  // let colors = [
  //     '#fff',
  //     '#81b1db',
  //     '#00aecd',
  //     '#2ebaae',
  //     '#7bd860',
  //     '#009688',
  //     '#3f51b5',
  //     '#607d8b',
  //     '#009999',
  //     '#ff5722',
  //     '#CCCC00',
  //     '#f32d4e',
  //     '#060760',
  //     '#fd60f7',
  //     '#f90d00',
  //     '#1f0253',
  //     '#218ca4',
  //     '#1f2b56'
  // ]

  let colors = [
    '#313695',
    '#4575b4',
    '#74add1',
    '#abd9e9',
    '#e0f3f8',
    '#ffffbf',
    '#fee090',
    '#fdae61',
    '#f46d43',
    '#d73027',
    '#a50026',
  ]
  // let colors = [
  //     '#fef6fa',
  //     '#f4ecf5',
  //     '#e9e1ef',
  //     '#dad8ea',
  //     '#c7cee4',
  //     '#b1c3de',
  //     '#97b8d8',
  //     '#78aed2',
  //     '#5ba2cb',
  //     '#4197c0',
  //     '#268dac',
  //     '#057878',
  //     '#026c5f',
  //     '#014837',
  // ]
  return colors[index]
}

function pointPosMap(eleIndex, azIndex, disIndex) {
  // return [
  //     [eleIndex + 1, azIndex + 1, disIndex],
  //     [eleIndex + 1, azIndex, disIndex],
  //     [eleIndex, azIndex, disIndex],
  //     [eleIndex, azIndex + 1, disIndex],
  //     [eleIndex + 1, azIndex + 1, disIndex + 1],
  //     [eleIndex + 1, azIndex, disIndex + 1],
  //     [eleIndex, azIndex, disIndex + 1],
  //     [eleIndex, azIndex + 1, disIndex + 1]
  // ]

  // return [
  //     [eleIndex, azIndex, disIndex],
  //     [eleIndex, azIndex, disIndex + 1],
  //     [eleIndex, azIndex + 1, disIndex + 1],
  //     [eleIndex, azIndex + 1, disIndex],
  //     [eleIndex + 1, azIndex, disIndex],
  //     [eleIndex + 1, azIndex, disIndex + 1],
  //     [eleIndex + 1, azIndex + 1, disIndex + 1],
  //     [eleIndex + 1, azIndex + 1, disIndex]
  // ]
  return [
    [eleIndex, azIndex + 1, disIndex + 1],
    [eleIndex, azIndex + 1, disIndex],
    [eleIndex, azIndex, disIndex],
    [eleIndex, azIndex, disIndex + 1],
    [eleIndex + 1, azIndex + 1, disIndex + 1],
    [eleIndex + 1, azIndex + 1, disIndex],
    [eleIndex + 1, azIndex, disIndex],
    [eleIndex + 1, azIndex, disIndex + 1],
  ]
}
