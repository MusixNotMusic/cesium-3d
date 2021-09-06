import * as THREE from 'three'
/**
 *  三维挤压
 */

export function computeExtrusionPointsAndColors (data) {

    const vertices = [];
    const indices = [];
    const colors = [];
  
    let offsetMapVerticesIndex = data.offsetMapVerticesIndex;
    let widthOfWin = data.CRHeaders.WidthofWin;

    // let BottomLatitude = data.CRHeaders.BottomLatitude / 360000;
    let TopLatitude = data.CRHeaders.TopLatitude / 360000;
    let LeftLongitude = data.CRHeaders.LeftLongitude / 360000;
    // let center = data.geography2XYZ(LeftLongitude, BottomLatitude);

    let centerLon = data.centerLon;
    let centerLat = data.centerLat;
    let center = data.geography2XYZ(centerLon, centerLat);
    
    let centerX = center.x;
    let centerY = center.y;
    let centerZ = center.z;

    let dncodeData = data.DecodeData;

    let len = dncodeData.length / 3;
  
    const color = new THREE.Color();

    // 默认色卡
    const colorCard = MeteoInstance.colorCard;

    // vertices
    for (let ii = 0; ii < len; ii ++) {
     
      let vertice = dncodeData.slice(ii * 3, (ii + 1) * 3);
      
    //   let lon = (vertice[0] + LeftLongitude) / 360000;
    //   let lat = (vertice[1] + BottomLatitude) / 360000;
      let lon = vertice[0] / 360000;
      let lat = vertice[1] / 360000;
      let val = vertice[2];

      let hei = data.linearHight(val);

    //   let result = data.translateByCenter(lon, lat, 0, centerX, centerY, centerZ);

      let result = data.geography2XYZ(lon + LeftLongitude , TopLatitude - lat);

      vertices.push(result.x - centerX, result.y - centerY, hei);

      if (colorCard) {
        color.setHex(colorCard[val]);
      } else {
        // http://csscoke.com/2015/01/01/rgb-hsl-hex/
        color.setHSL(((1 - val / 255) * 140 - 20 ) / 360, 1.0, 0.5);
      }
      colors.push(color.r, color.g, color.b);
    }
  
    //
    /** 
      * a _______ b
      *  |       |
      *  |       |
      *  |_______|  
      * c         d
      *  let a = offset
      *  let b = offset + 1
      *  let c = offset + widthOfWin
      *  let d = offset + 1 + widthOfWin 
      */
    console.log('offsetMapVerticesIndex =>', widthOfWin);
    for (let offset in offsetMapVerticesIndex) {
      offset = +offset;
      const a = offset;
      const b = offset + 1;
      const c = offset + widthOfWin;
      const d = offset + 1 + widthOfWin;
      if (offsetMapVerticesIndex[c] && offsetMapVerticesIndex[d]) {
        indices.push(
          offsetMapVerticesIndex[d],
          offsetMapVerticesIndex[c],
          offsetMapVerticesIndex[a]
        )
      }
  
      if (offsetMapVerticesIndex[b] && offsetMapVerticesIndex[d]) {
        indices.push(
          offsetMapVerticesIndex[d],
          offsetMapVerticesIndex[b],
          offsetMapVerticesIndex[a]
        )
      }
    }
    offsetMapVerticesIndex = null;
  
    return {
      vertices,
      colors,
      indices
    }
}