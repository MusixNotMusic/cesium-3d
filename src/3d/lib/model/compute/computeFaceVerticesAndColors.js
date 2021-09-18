import * as THREE from 'three'
export function computePointsAndColors(data) {
  const vertices = []
  const indices = []
  const colors = []
  const normals = []

  let offsetMapVerticesIndex = {}

  const color = new THREE.Color()
  let elevaLen = data.Header.ElevationCount
  let azimuthLen = 360
  let gateLen = data.Header.Gates[data.Header.BandNo]
  let limit = 200

  // 默认色卡
  const colorCard = MeteoInstance.colorCard;
  console.log('colorCard ===>', colorCard, data)

  // vertices
  for (let eleIndex = 0; eleIndex < elevaLen; eleIndex++) {
    for (let azIndex = 0; azIndex < azimuthLen; azIndex++) {
      for (let disIndex = 0; disIndex < gateLen; disIndex++) {
        let result = data.getOriginVal(eleIndex, azIndex, disIndex)
        let val = result.val
        let offset = result.offset
        if (val > 2) {
          let coords = data.polar2Cartesian(eleIndex, azIndex, disIndex)
          vertices.push(coords[0], coords[1], coords[2])
          normals.push(0, 1, 0)
          // offset 隐射 顶点索引
          offsetMapVerticesIndex[offset] = vertices.length / 3 - 1
        }

        if (val > 2) {
          if (colorCard) {
            color.setHex(colorCard[val | 0]);
          } else {
            color.setHSL(val / 50, 1.0, 0.5);
          }
          colors.push(color.r, color.g, color.b);
        }
      }
    }
  }

  //
  /**
     *  const a = eleIndex * azimuthLen * gateLen + azIndex * gateLen + disIndex + 1
        const b = eleIndex * azimuthLen * gateLen + azIndex * gateLen + disIndex
        const c = eleIndex * azimuthLen * gateLen + (azIndex + 1) * gateLen + disIndex
        const d = eleIndex * azimuthLen * gateLen + (azIndex + 1) * gateLen + disIndex + 1
     */
  for (let offset in offsetMapVerticesIndex) {
    let azIndex = Math.ceil((offset % (azimuthLen * gateLen)) / gateLen)
    const b = parseInt(offset)
    const a = b + 1
    let c, d
    if (azIndex === azimuthLen) {
      c = b - gateLen * (azIndex - 1)
      d = b - gateLen * (azIndex - 1) + 1
    } else {
      c = b + gateLen
      d = b + gateLen + 1
    }
    if (offsetMapVerticesIndex[a] && offsetMapVerticesIndex[d]) {
      indices.push(
        offsetMapVerticesIndex[a],
        offsetMapVerticesIndex[b],
        offsetMapVerticesIndex[d]
      )
    }

    if (offsetMapVerticesIndex[c] && offsetMapVerticesIndex[d]) {
      indices.push(
        offsetMapVerticesIndex[b],
        offsetMapVerticesIndex[c],
        offsetMapVerticesIndex[d]
      )
    }
  }
  offsetMapVerticesIndex = null

  return {
    vertices,
    colors,
    normals,
    indices,
  }
}
