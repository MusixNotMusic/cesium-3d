import * as d3 from 'd3'
/**
 * @param {*} layers  二维像素数据
 * [
 *  [a1, a2, ...],
 *  [b1, b2, ...],
 *  [c1, c2, ...],
 *  .
 *  .
 *  .
 *  [...]
 * ]
 * 
 */


/**
* 预处理像素高度 压缩像素高度
* @param {*} layers 
* @param {*} evelations 
* @returns 
*/
export function preprocessImageData (layers, evelations) {
   let maxHeight = 0;
   let likeArr = {};
   for (let y = 0; y < layers.length; y++) {
       let ele = evelations[layers.length - y - 1];
       for (let x = 0; x < layers[y].length; x++) {
           let obj = layers[y][x];
           let hei = Math.tan(ele / 180 * Math.PI) * obj.binIndex;
           if (maxHeight < hei && obj.val > 0) {
               maxHeight = hei;
           }
       }
   }
   maxHeight = maxHeight | 0;
   likeArr.height = maxHeight;
   likeArr.width = layers[0].length;
   for (let m = layers.length - 1; m > 0; m--) {
       let ele = evelations[layers.length - m - 1];
       for (let n = 0; n < layers[m].length; n++) {
           let obj = layers[m][n];
           let hei = Math.tan(ele / 180 * Math.PI) * obj.binIndex | 0;
           if (obj.val > 0) {
           if (!likeArr[hei]) {
               likeArr[hei] = {};
           }
           likeArr[hei][n] = obj;
       }
       }
   }
   return likeArr;
}

/**
 * 二维 插值 bilinear
 * @param {*} func 
 * @returns 
 */
export const bilinearInterpolator = func => (x, y) => {
    // "func" is a function that takes 2 integer arguments and returns some value
    const x1 = Math.floor(x);
    const x2 = Math.ceil(x);
    const y1 = Math.floor(y);
    const y2 = Math.ceil(y);
  
    if ((x1 === x2) && (y1 === y2)) return func(x1, y1);
    if (x1 === x2) {
      return (func(x1, y1) * (y2 - y) + func(x1, y2) * (y - y1)) / (y2 - y1);
    }
    if (y1 === y2) {
      return (func(x1, y1) * (x2 - x) + func(x2, y1) * (x - x1)) / (x2 - x1);
    }
  
    // else: x1 != x2 and y1 != y2
    return (
      func(x1, y1) * (x2 - x) * (y2 - y) +
      func(x2, y1) * (x - x1) * (y2 - y) +
      func(x1, y2) * (x2 - x) * (y - y1) +
      func(x2, y2) * (x - x1) * (y - y1)
    )
    / ((x2 - x1) * (y2 - y1));
}

/**
 * 
 * @param {*} data 二维数组 数据源
 * @param {*} canvas dom canvas画布
 * @param {*} pixelSize  像素大小
 * @param {*} colorFunc  颜色比例尺
 * @returns 
 */
export function imageShow(data, canvas, pixelSize, colorFunc) {
    // Flatten 2D input array
    const flat = [].concat.apply([], data);
    // Color Scale & Min-Max normalization
    // Shape of input array
    const shape = {x: data[0].length, y: data.length};
  
    // Set up canvas element
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    canvas.style.width  = `${shape.x * pixelSize}px`;
    canvas.style.height = `${shape.y * pixelSize}px`;
    canvas.width = shape.x * pixelSize;
    canvas.height = shape.y * pixelSize;
    canvas.style.imageRendering = "pixelated";
  
    // Draw pixels to the canvas
    const imageData = context.createImageData(shape.x, shape.y);
    flat.forEach((d, i) => {
      let color = isNaN(d) ? {r: 0, g: 0, b: 0} : d3.color(colorFunc(d));
      if (!color) {
        console.log('color ==>', color);
      }
      imageData.data[i*4  ] = color.r;
      imageData.data[i*4+1] = color.g;
      imageData.data[i*4+2] = color.b;
      imageData.data[i*4+3] = 255;
    });
    context.putImageData(imageData, 0, 0);
  
    return canvas;
}


/** 
 *  j
 *  | . . . . . . . 
 *  | . . . . . . .
 *  | . . . . . . .
 *  | . . . . . . . 
 *  | . . . # . . . 
 *  + ------------- i
 *  # 向上寻找非空/0值
 * @param {*} i 
 * @param {*} j 
 * @returns 
 */
function findUpVal(i, j, likeArr) {
    let val = 0;
    let height = likeArr.height;
    while(j < height) {
        j++;
        if(likeArr[j] && likeArr[j][i] && likeArr[j][i].val !== 0) {
            return likeArr[j][i].val;
        }
    }
    return val;
}

/**
 * 体扫空间 伪插值 平面
 * @param {*} layers 
 * @oaram {*} evelations 仰角
 * @oaram {*} isInter 是否插值
 */
export function calcSpaceInterData (layers, evelations, isInter) {
    // let now = Date.now();
    let likeArr = preprocessImageData(layers, evelations);
    console.log('maxHeight ==>', likeArr);
    // 预处理 插值

    const width = likeArr.width;
    const height = likeArr.height;
    // const interpolate = bilinearInterpolator((i, j) => likeArr[j] && likeArr[j][i] ? likeArr[j][i].val : findUpVal(i, j));
    // const results = d3.range(0, height - 1, 1).map(y => (
    //     d3.range(0, width - 1, 1).map(x => {
    //         return interpolate(x, y);
    //     })
    // ));
    let result = [];
    for (let y = 0; y < height; y++) {
        result[y] = [];
        for (let x = 0; x < width; x++) {
            result[y][x] =  likeArr[y] && likeArr[y][x] ? likeArr[y][x].val : (isInter ? findUpVal(x, y, likeArr) : 0);
        }
    }
    
    return result;
}


 /**
  * 格点高度插值
  * @param {*} layers 
  */
export function calcGridInterData (layers, heightInterN) {
    const n = heightInterN || 10;
    const width = layers[0].length;
    const height = layers.length;
    const interpolate = bilinearInterpolator((i, j) => layers[j][i].val);
    const results = d3.range(0, height - 1, 1 / n).map(y => (
        d3.range(0, width - 1, 1).map(x => {
            return interpolate(x, y);
        })
    ));
    return results;
}