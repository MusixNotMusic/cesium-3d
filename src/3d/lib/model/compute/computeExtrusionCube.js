import * as THREE from 'three'
/**
 *  三维挤压
 */

export function computeExtrusionCubeAndColors (data) {

    const vertices = [];
    // const indices = [];
    const colors = [];
  
    // let offsetMapVerticesIndex = data.offsetMapVerticesIndex;
    let indicesCubes = [];
    // let widthOfWin = data.CRHeaders.WidthofWin;

    // let BottomLatitude = data.CRHeaders.BottomLatitude / 360000;
    let TopLatitude = data.CRHeaders.TopLatitude / 360000;
    let LeftLongitude = data.CRHeaders.LeftLongitude / 360000;
    // let center = data.geography2XYZ(LeftLongitude, BottomLatitude);

    let centerLon = data.centerLon;
    let centerLat = data.centerLat;
    let center = data.geography2XYZ(centerLon, centerLat);
    
    let centerX = center.x;
    let centerY = center.y;
    // let centerZ = center.z;

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

      // center 
      let result = data.geography2XYZ(lon + LeftLongitude , TopLatitude - lat);
      // up
      // let leftTop = data.geography2XYZ(lon / 2 + LeftLongitude , TopLatitude - lat / 2);
      // let rightTop = data.geography2XYZ(lon * 3 / 2 + LeftLongitude , TopLatitude - lat / 2);
      // let leftBottom = data.geography2XYZ(lon / 2 + LeftLongitude , TopLatitude - lat * 3 / 2);
      // let rightBottom = data.geography2XYZ(lon * 3 / 2 + LeftLongitude , TopLatitude - lat * 3 / 2);
      let cubeWidth = 50;

      let leftTop = { x: result.x - cubeWidth, y: result.y - cubeWidth };
      let rightTop = { x: result.x + cubeWidth, y: result.y - cubeWidth };
      let leftBottom = { x: result.x - cubeWidth, y: result.y + cubeWidth };
      let rightBottom = { x: result.x + cubeWidth, y: result.y + cubeWidth };

      let a = ii * 8;
      let b = ii * 8 + 1;
      let c = ii * 8 + 2;
      let d = ii * 8 + 3;
      let e = ii * 8 + 4;
      let f = ii * 8 + 5;
      let g = ii * 8 + 6;
      let h = ii * 8 + 7;

      // vertices
      vertices.push(leftTop.x - centerX, leftTop.y - centerY, hei); // index
      vertices.push(rightTop.x - centerX, rightTop.y - centerY, hei); // index + 1
      vertices.push(rightBottom.x - centerX, rightBottom.y - centerY, hei); // index + 2
      vertices.push(leftBottom.x - centerX, leftBottom.y - centerY, hei); // index + 3
      vertices.push(leftTop.x - centerX, leftTop.y - centerY, 0); // index + 4
      vertices.push(rightTop.x - centerX, rightTop.y - centerY, 0); // index + 5
      vertices.push(rightBottom.x - centerX, rightBottom.y - centerY, 0); // index + 6
      vertices.push(leftBottom.x - centerX, leftBottom.y - centerY, 0); // index + 7


      // indicesCubes

      // top face 
      indicesCubes.push(a, c, d);
      indicesCubes.push(c, b, a);
      // bottom face
      // indicesCubes.push(e, g, h);
      // indicesCubes.push(g, f, e);
      //front face
      indicesCubes.push(d, g, h);
      indicesCubes.push(g, c, d);
      // back face 
      indicesCubes.push(b, e, f);
      indicesCubes.push(e, a, b);
      // left face
      indicesCubes.push(a, h, e);
      indicesCubes.push(h, d, a);
      // right face
      indicesCubes.push(c, f, g);
      indicesCubes.push(f, b, c);

      if (colorCard) {
        color.setHex(colorCard[val]);
      } else {
        // http://csscoke.com/2015/01/01/rgb-hsl-hex/
        color.setHSL(((1 - val / 255) * 140 - 20 ) / 360, 1.0, 0.5);
      }
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
    }
  
    // //
    // /** 
    //   * a _______ b
    //   *  |       |
    //   *  |       |
    //   *  |_______|  
    //   * c         d
    //   *  let a = offset
    //   *  let b = offset + 1
    //   *  let c = offset + widthOfWin
    //   *  let d = offset + 1 + widthOfWin 
    //   */
    // console.log('offsetMapVerticesIndex =>', widthOfWin);
    // for (let offset in offsetMapVerticesIndex) {
    //   offset = +offset;
    //   const a = offset;
    //   const b = offset + 1;
    //   const c = offset + widthOfWin;
    //   const d = offset + 1 + widthOfWin;
    //   if (offsetMapVerticesIndex[c] && offsetMapVerticesIndex[d]) {
    //     indices.push(
    //       offsetMapVerticesIndex[d],
    //       offsetMapVerticesIndex[c],
    //       offsetMapVerticesIndex[a]
    //     )
    //   }
  
    //   if (offsetMapVerticesIndex[b] && offsetMapVerticesIndex[d]) {
    //     indices.push(
    //       offsetMapVerticesIndex[d],
    //       offsetMapVerticesIndex[b],
    //       offsetMapVerticesIndex[a]
    //     )
    //   }
    // }
    // offsetMapVerticesIndex = null;
  
    return {
      vertices,
      indices: indicesCubes,
      colors,
      // indices
    }
}