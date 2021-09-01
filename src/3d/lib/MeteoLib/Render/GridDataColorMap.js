import * as Cesium from 'cesium'

var tbbColorMap = [
  [Number.MIN_VALUE, 210, [160, 0, 200, 255], '≤210k'],
  [210, 220, [130, 0, 220, 255], '210-220k'],
  [220, 230, [30, 60, 255, 255], '220-230k'],
  [230, 240, [0, 160, 255, 255], '230-240k'],
  [240, 250, [0, 200, 200, 255], '240-250k'],
  [250, 260, [0, 210, 140, 255], '250-260k'],
  [260, 270, [160, 230, 50, 255], '260-270k'],
  [270, 280, [230, 220, 50, 255], '270-280k'],
  [280, 290, [230, 175, 45, 255], '280-290k'],
  [290, 300, [240, 130, 40, 255], '290-300k'],
  [300, 310, [250, 60, 60, 255], '300-310k'],
  [310, Number.MAX_VALUE, [240, 0, 130, 255], '≥310k'],
]
//    var tbbColorMap = [
//		[Number.MIN_VALUE, 211, [156, 0, 1, 4], "≤211k"],
//		[211.01, 221, [253, 253, 253, 255], "211-221k"],
//		[221.01, 241, [191, 196, 3, 255], "221-241k"],
//		[241.01, 260, [8, 5, 186, 255], "241-260k"],
//		[260.01, 273, [179, 8, 180, 255], "260-173k"],
//		[273.01, Number.MAX_VALUE, [180, 177, 181, 255], ">273k"]
//	];

var typhoonColorMap = [
  [Number.MIN_VALUE, 210, [160, 0, 200, 255], '≤210k'],
  [210, 220, [130, 0, 220, 255], '210-220k'],
  [220, 230, [30, 60, 255, 255], '220-230k'],
  [230, 240, [0, 160, 255, 255], '230-240k'],
  [240, 250, [0, 200, 200, 255], '240-250k'],
  [250, 260, [0, 210, 140, 255], '250-260k'],
  [260, 270, [160, 230, 50, 255], '260-270k'],
  [270, 280, [230, 220, 50, 255], '270-280k'],
  [280, 290, [230, 175, 45, 255], '280-290k'],
  [290, 300, [240, 130, 40, 255], '290-300k'],
  [300, 310, [250, 60, 60, 255], '300-310k'],
  [310, Number.MAX_VALUE, [240, 0, 130, 255], '≥310k'],
]
//雷达图例
var radarColorMap = [
  //[Number.MIN_VALUE, -32, [0, 0, 0, 0], "≤210k"],
  [-32, -5, [0, 0, 162, 150], '-32~-5'],
  [-5, 0, [0, 173, 165, 150], '-5~0'],
  [0, 5, [193, 193, 255, 150], '0~5'],
  [5, 10, [122, 114, 235, 150], '5~10'],
  [10, 15, [30, 38, 209, 150], '10~15'],
  [15, 20, [167, 253, 169, 150], '15~20'],
  [20, 25, [0, 235, 0, 150], '20~25'],
  [25, 30, [16, 147, 26, 150], '25~30'],
  [30, 35, [255, 245, 100, 150], '30~35'],
  [35, 40, [201, 201, 2, 150], '35~40'],
  [40, 45, [141, 141, 0, 150], '40~45'],
  [45, 50, [255, 173, 173, 150], '45~50'],
  [50, 55, [255, 100, 92, 150], '50~55'],
  [55, 60, [239, 2, 48, 150], '55~60'],
  [60, 65, [213, 143, 255, 150], '60~65'],
  [65, Number.MAX_VALUE, [171, 36, 251, 150], '≥65'],
]
//    //云分类图例
//    var clcColorMap = [
//		[-1, 0,    [160, 0, 200, 255  ], "晴空海面"],
//		[0.1, 1,   [130, 0, 220, 255  ], "晴空陆地"],
//		[10, 11,   [30, 60, 255, 255  ], "混合像元"],
//		[11.1, 12, [0, 160, 255, 255  ], "高层云或雨层云"],
//		[12.1, 13, [0, 200, 200, 255  ], "卷层云"],
//		[13.1, 14, [0, 210, 140, 255  ], "密卷云"],
//		[14.1, 15, [160, 230, 50, 255], "积雨云"],
//		[15.1, 21, [230, 220, 50, 255], "层积云或高积云"]
//	];
//云分类图例
var clcColorMap = [
  [-1, 0, [0, 135, 245, 255], '晴空海面'],
  [0.1, 1, [60, 180, 177, 255], '晴空陆地'],
  [10, 11, [255, 172, 98, 255], '混合像元'],
  [11.1, 12, [129, 129, 129, 255], '高层云或雨层云'],
  [12.1, 13, [193, 193, 193, 255], '卷层云'],
  [13.1, 14, [255, 255, 255, 255], '密卷云'],
  [14.1, 15, [250, 245, 0, 255], '积雨云'],
  [15.1, 21, [197, 179, 159, 255], '层积云或高积云'],
]
//可降雨量图例
var preColorMap = [
  [0.99, 9, [129, 195, 207, 200], '1-9mm'],
  [9.99, 24, [94, 98, 185, 200], '10-24mm'],
  [24.99, 49, [227, 90, 235, 200], '25-49mm'],
  [49.99, 99, [129, 116, 90, 200], '50-99mm'],
  [99.99, Number.MAX_VALUE, [241, 28, 76, 200], '≥100mm'],
]
//海面风速图例
var ascatWinSpeedColorMap = [
  [Number.MIN_VALUE, -0.01, [0, 0, 0, 0], '~0m/s'],
  [-0.01, 1, [155, 1, 255, 180], '0~1m/s'],
  [1.01, 2, [104, 1, 255, 180], '1~2m/s'],
  [2.01, 3, [57, 9, 255, 180], '2~3m/s'],
  [3.01, 4, [16, 54, 255, 180], '3~4m/s'],
  [4.01, 5, [1, 91, 255, 180], '4~5m/s'],
  [5.01, 6, [1, 120, 255, 180], '5~6m/s'],
  [6.01, 7, [1, 154, 255, 180], '6~7m/s'],
  [7.01, 8, [0, 221, 255, 180], '7~8m/s'],
  [8.01, 9, [1, 255, 1, 180], '8~9m/s'],
  [9.01, 10, [120, 255, 1, 180], '9~10m/s'],
  [10.01, 11, [180, 255, 1, 180], '10~11m/s'],
  [11.01, 12, [239, 255, 1, 180], '11~12m/s'],
  [12.01, 13, [255, 255, 1, 180], '12~13m/s'],
  [13.01, 14, [255, 251, 1, 180], '13~14m/s'],
  [14.01, 55, [255, 231, 1, 180], '14~15m/s'],
  [15.01, 16, [255, 206, 1, 180], '15~16m/s'],
  [16.01, 17, [255, 180, 1, 180], '16~17m/s'],
  [17.01, 18, [255, 146, 1, 180], '17~18m/s'],
  [18.01, 19, [255, 92, 1, 180], '18~19m/s'],
  [19.01, 20, [255, 33, 1, 180], '19~20m/s'],
  [20.01, Number.MAX_VALUE, [0, 0, 0, 0], '20~m/s'],
]
//    var ascatWinSpeedColorMap2 = [[-0.01, 0.5, [155, 1, 255, 255], "0~0.5m/s"], [0.49, 1, [155, 1, 255, 255], "0.5~1m/s"], [0.99, 1.5, [104, 1, 255, 255], "1~1.5m/s"], [1.49, 2, [104, 1, 255, 255], "1.5~2m/s"], [1.99, 2.5, [58, 9, 255, 255], "2~2.5m/s"], [2.49, 3, [57, 9, 255, 255], "2.5~3m/s"], [2.99, 3.5, [26, 41, 254, 255], "3~3.5m/s"], [3.49, 4, [16, 54, 255, 255], "3.5~4m/s"], [3.99, 4.5, [1, 91, 255, 255], "4~4.5m/s"], [4.49, 5, [1, 120, 255, 255], "4.5~5m/s"], [4.99, 5.5, [1, 154, 255, 255], "5~5.5m/s"], [5.49, 6, [1, 187, 255, 255], "5.5~6m/s"], [5.99, 6.5, [1, 205, 255, 255], "6~6.5m/s"], [6.49, 7, [1, 233, 255, 255], "6.5~7m/s"], [6.99, 7.5, [1, 255, 255, 255], "7~7.5m/s"], [7.49, 8, [1, 255, 228, 255], "7.5~8m/s"], [7.99, 8.5, [1, 255, 165, 255], "8~8.5m/s"], [8.49, 9, [1, 255, 78, 255], "8.5~9m/s"], [8.99, 9.5, [14, 255, 1, 255], "9~9.5m/s"], [9.49, 10, [48, 255, 1, 255], "9.5~10m/s"], [9.99, 10.5, [84, 255, 1, 255], "10~10.5m/s"], [10.49, 11, [112, 255, 1, 255], "10.5~11m/s"], [10.99, 11.5, [145, 255, 1, 255], "11~11.5m/s"], [11.49, 12, [179, 255, 1, 255], "11.5~12m/s"], [11.99, 12.5, [214, 255, 1, 255], "12~12.5m/s"], [12.49, 13, [247, 255, 1, 255], "12.5~13m/s"], [12.99, 13.5, [255, 255, 1, 255], "13~13.5m/s"], [13.49, 14, [255, 251, 1, 255], "13.5~14m/s"], [13.99, 14.5, [255, 245, 1, 255], "14~14.5m/s"], [14.49, 15, [255, 244, 1, 255], "14.5~15m/s"], [14.99, 15.5, [255, 231, 1, 255], "15~15.5m/s"], [15.49, 16, [255, 218, 1, 255], "15.5~16m/s"], [15.99, 16.5, [255, 206, 1, 255], "16~16.5m/s"], [16.49, 17, [255, 180, 1, 255], "16.5~17m/s"], [16.99, 17.5, [255, 180, 1, 255], "17~17.5m/s"], [17.49, 18, [255, 146, 1, 255], "17.5~18m/s"], [17.99, 18.5, [255, 146, 1, 255], "18~18.5m/s"], [18.49, 19, [255, 92, 1, 255], "18.5~19m/s"], [18.99, 19.5, [255, 92, 1, 255], "19~19.5m/s"], [19.49, 20, [255, 33, 1, 255], "19.5~20m/s"]]
var ascatWinSpeedColorMap2 = [
  [-0.01, 0.5, [155, 1, 255, 255], '0m/s'],
  [0.49, 1, [155, 1, 255, 255], ''],
  [0.99, 1.5, [104, 1, 255, 255], ''],
  [1.49, 2, [104, 1, 255, 255], ''],
  [1.99, 2.5, [58, 9, 255, 255], ''],
  [2.49, 3, [57, 9, 255, 255], ''],
  [2.99, 3.5, [26, 41, 254, 255], ''],
  [3.49, 4, [16, 54, 255, 255], ''],
  [3.99, 4.5, [1, 91, 255, 255], ''],
  [4.49, 5, [1, 120, 255, 255], ''],
  [4.99, 5.5, [1, 154, 255, 255], '5m/s'],
  [5.49, 6, [1, 187, 255, 255], ''],
  [5.99, 6.5, [1, 205, 255, 255], ''],
  [6.49, 7, [1, 233, 255, 255], ''],
  [6.99, 7.5, [1, 255, 255, 255], ''],
  [7.49, 8, [1, 255, 228, 255], ''],
  [7.99, 8.5, [1, 255, 165, 255], ''],
  [8.49, 9, [1, 255, 78, 255], ''],
  [8.99, 9.5, [14, 255, 1, 255], ''],
  [9.49, 10, [48, 255, 1, 255], ''],
  [9.99, 10.5, [84, 255, 1, 255], '10m/s'],
  [10.49, 11, [112, 255, 1, 255], ''],
  [10.99, 11.5, [145, 255, 1, 255], ''],
  [11.49, 12, [179, 255, 1, 255], ''],
  [11.99, 12.5, [214, 255, 1, 255], ''],
  [12.49, 13, [247, 255, 1, 255], ''],
  [12.99, 13.5, [255, 255, 1, 255], ''],
  [13.49, 14, [255, 251, 1, 255], ''],
  [13.99, 14.5, [255, 245, 1, 255], ''],
  [14.49, 15, [255, 244, 1, 255], ''],
  [14.99, 15.5, [255, 231, 1, 255], '15m/s'],
  [15.49, 16, [255, 218, 1, 255], ''],
  [15.99, 16.5, [255, 206, 1, 255], ''],
  [16.49, 17, [255, 180, 1, 255], ''],
  [16.99, 17.5, [255, 180, 1, 255], ''],
  [17.49, 18, [255, 146, 1, 255], ''],
  [17.99, 18.5, [255, 146, 1, 255], ''],
  [18.49, 19, [255, 92, 1, 255], ''],
  [18.99, 19.5, [255, 92, 1, 255], ''],
  [19.49, 20, [255, 33, 1, 255], '20m/s'],
]

const GridDataColorMap = {
  CLC: clcColorMap,
  TBB: tbbColorMap,
  PRE: preColorMap,
  TYPHOON: typhoonColorMap,
  RADAR: radarColorMap,
  ASCATWINSPEED: ascatWinSpeedColorMap2,
}

// GridDataColorMap._fromMICAPSPalatteXml4Node = function (uri) {
//     var fs = require('fs');
//     var parseString = require('xml2js').parseString;
//     if (!fs.existsSync(uri)) {
//         throw new Error("图例文件”" + uri + "“未找到");
//     }
//     var promise = Cesium.when.defer();
//     var xmlText = fs.readFileSync(uri, "utf-8")
//     parseString(xmlText, function (err, result) {
//         if (err) {
//             promise.reject(err);
//         } else {
//             var colorMap = [];
//             for (var i = 0; i < result.palette.entry.length; i++) {
//                 var entry = result.palette.entry[i];
//                 if (i == 0) {
//                     colorMap.push([
//                         -Number.MAX_VALUE, parseFloat(entry.$.value), JSON.parse("[" + entry.$.rgba + "]"),
//                         "<=" + entry.$.value
//                     ]);
//                 } else {
//                     var entry0 = result.palette.entry[i - 1];
//                     colorMap.push([
//                         parseFloat(entry0.$.value), parseFloat(entry.$.value), JSON.parse("[" + entry.$.rgba + "]"),
//                         entry0.$.value + "~" + entry.$.value
//                     ]);
//                 }
//                 if (i == result.palette.entry.length - 1) {
//                     colorMap.push([
//                         parseFloat(entry.$.value), Number.MAX_VALUE, JSON.parse("[" + entry.$.rgba + "]"),
//                         ">=" + entry.$.value
//                     ]);
//                 }
//             }

//             promise.resolve(colorMap);
//         }
//     });
//     return promise;
// }

/**
 * micaps图例解析
 * @param {String} uri
 * @return {Promise.<MeteoLib.Render.GridDataColorMap>}
 */
GridDataColorMap.fromMICAPSPalatteXml = function (uri) {
  if (typeof document == 'undefined') {
    return GridDataColorMap._fromMICAPSPalatteXml4Node(uri)
  } else {
    return Cesium.loadXML(uri).then(function (xml) {
      var colorMap = []
      var entries = xml.getElementsByTagName('entry')
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i]
        var value = entry.getAttribute('value')
        var rgba = entry.getAttribute('rgba')
        if (value && rgba) {
          value = parseFloat(value)
          rgba = JSON.parse('[' + rgba + ']')

          if (i == 0) {
            colorMap.push([-Number.MAX_VALUE, value, rgba, '<=' + value])
          } else {
            var entry0 = entries[i - 1]
            var value0 = entry0.getAttribute('value')
            if (value0) {
              value0 = parseFloat(value)

              colorMap.push([value0, value, rgba, value0 + '~' + value])
            } else {
              colorMap.push([value, value, rgba, value])
            }
          }
          if (i == entries.length - 1) {
            colorMap.push([value, Number.MAX_VALUE, rgba, '>=' + value])
          }
        }
      }
      return colorMap
    })
  }
}

function parsePalArrayBuffer(palArrayBuffer, rangeFlip, defer) {
  try {
    var encoding = 'gb2312'
    var decoder = new TextDecoder(encoding)
    var palText = decoder.decode(palArrayBuffer, { stream: true })

    var colorMap = []
    var items = palText.split(/[\r\n]+/)
    var startValue = Number.MIN_VALUE
    var r = 0,
      g = 0,
      b = 0,
      a = 255
    if (items.length > 1) {
      var newItems = []
      for (var i = 0; i < items.length; i++) {
        var item = items[i].trim()
        if (item === '') {
          continue
        }
        newItems.push(item)
      }
      items = newItems
      for (var i = 1; i < items.length; i++) {
        var item = items[i].trim()
        var itemParts = item.split(/\s+/)
        var newitemParts = []
        itemParts.forEach(function (it) {
          try {
            it = parseFloat(it)
            if (!isNaN(it)) {
              newitemParts.push(it)
            }
          } catch (e) {}
        })
        itemParts = newitemParts
        if (itemParts.length < 2) continue
        var isRange = itemParts && itemParts.length && itemParts.length == 5
        if (!isRange) {
          if (!rangeFlip) {
            r = parseInt(itemParts[1])
            g = parseInt(itemParts[2])
            b = parseInt(itemParts[3])
          } else {
            r = parseInt(itemParts[0])
            g = parseInt(itemParts[1])
            b = parseInt(itemParts[2])
          }
          if (i >= 1) {
            var endValue = parseFloat(itemParts[0])
            if (rangeFlip) {
              endValue = parseFloat(itemParts[3])
            }
            if (i == 1) {
              colorMap.push([startValue, endValue, [r, g, b, a], endValue])
            } else {
              colorMap.push([
                startValue + 0.00001,
                endValue,
                [r, g, b, a],
                startValue,
              ])
            }
          }
          if (i == items.length - 1) {
            //r = parseInt(itemParts[1]);
            //g = parseInt(itemParts[2]);
            //b = parseInt(itemParts[3]);
            var endValue = parseFloat(itemParts[0])
            if (rangeFlip) {
              endValue = parseFloat(itemParts[3])
            }
            colorMap.push([
              endValue,
              Number.MAX_VALUE,
              [r, g, b, a],
              startValue,
            ])
          }
          startValue = parseFloat(itemParts[0])
          if (rangeFlip) {
            startValue = parseFloat(itemParts[3])
          }
        } else {
          if (!rangeFlip) {
            startValue = parseFloat(itemParts[3])
            var endValue = parseFloat(itemParts[4])
            r = parseInt(itemParts[0])
            g = parseInt(itemParts[1])
            b = parseInt(itemParts[2])
            colorMap.push([
              startValue,
              endValue,
              [r, g, b, a],
              startValue + '~' + endValue,
            ])
          } else {
            startValue = parseFloat(itemParts[0])
            var endValue = parseFloat(itemParts[1])
            r = parseInt(itemParts[2])
            g = parseInt(itemParts[3])
            b = parseInt(itemParts[4])
            colorMap.push([
              startValue,
              endValue,
              [r, g, b, a],
              startValue + '~' + endValue,
            ])
          }
        }
      }
    }

    defer.resolve(colorMap)
  } catch (err) {
    defer.reject(err)
  }
}
/**
 *从pal调色板文件中加载图例
 *@param {String|ArrayBuffer} palURLOrArrayBuffer
 *@return {Promise.<MeteoLib.Render.GridDataColorMap>}
 *@memberof MeteoLib.Render.GridDataColorMap
 */
GridDataColorMap.fromPal = function (palURLOrArrayBuffer, rangeFlip) {
  var defer = Cesium.when.defer()
  if (typeof palURLOrArrayBuffer === 'string') {
    Cesium.loadArrayBuffer(palURLOrArrayBuffer)
      .then(function (palArrayBuffer) {
        parsePalArrayBuffer(palArrayBuffer, rangeFlip, defer)
      })
      .otherwise(function (err) {
        defer.reject(err)
      })
  } else {
    setTimeout(function () {
      parsePalArrayBuffer(palURLOrArrayBuffer, defer)
    }, 30)
  }
  return defer
}
/**
 *
 *@param {Number} val
 *@param {MeteoLib.Render.GridDataColorMap} colorMap
 *@return {Array.<Number>} rgba
 *@memberof MeteoLib.Render.GridDataColorMap
 */
GridDataColorMap.getColor = function (val, colorMap) {
  if (isNaN(val)) return [0, 0, 0, 0]
  for (var i = 0; i < colorMap.length; i++) {
    if (val > colorMap[i][0] && val <= colorMap[i][1]) {
      console.log('value-color:', val, colorMap[i][2])
      return colorMap[i][2]
    }
  }

  return [0, 0, 0, 0]
}
/**
 *
 *@param {Number} value
 *@param {MeteoLib.Render.GridDataColorMap} colorMap
 *@return {Number} index
 *@memberof MeteoLib.Render.GridDataColorMap
 */
GridDataColorMap.getRangeIndex = function (value, colorMap) {
  if (isNaN(value)) {
    return 0
  }
  var dV = (colorMap[colorMap.length - 1][1] - colorMap[0][1]) / colorMap.length
  var p = (value - colorMap[0][1]) / dV
  var id = Math.ceil(p)
  if (id < 0) {
    return 0
  } else if (id > colorMap.length - 1) {
    return colorMap.length - 1
  }
  console.log('MeteoLib.js getRangeIndex:', value, colorMap, id, dV, p)
  return id
}

/**
 *画垂直布局且有间隔的图例，返回图例图片
 *@param {MeteoLib.Render.GridDataColorMap} colorMap
 *@param {Number} recSize
 *@param {Number} legendSize
 *@param {Object} recMargins
 *@param {Number} recMargins.left
 *@param {Number} recMargins.right
 *@param {Number} recMargins.top
 *@param {Number} recMargins.bottom
 *@param {Object} legendPadding
 *@param {Number} legendPadding.left
 *@param {Number} legendPadding.right
 *@param {Number} legendPadding.top
 *@param {Number} legendPadding.bottom
 *@param {Number} fontSize
 *@returns {Object} imageObj
 *@returns {String} imageObj.imageUrl
 *@returns {Number} imageObj.width
 *@returns {Number} imageObj.height
 *@memberof MeteoLib.Render.GridDataColorMap
 */
GridDataColorMap.getLegend = function (
  colorMap,
  recSize,
  legendSize,
  recMargins,
  legendPadding,
  fontSize
) {
  // if (colorMap[0][0] < colorMap[colorMap.length - 1][0]) {
  //     colorMap.reverse();
  // }

  if (recSize == undefined) recSize = { width: 20, height: 16 }
  if (recMargins == undefined)
    recMargins = { left: 10, right: 5, top: 0, bottom: 5 }
  if (legendPadding == undefined)
    legendPadding = { left: 0, right: 10, top: 5, bottom: 5 }
  if (fontSize == undefined) {
    fontSize = recSize.height
  }

  var bgColor = [230, 230, 230, 180]
  var borderColor = 'rgba(85,150,220,0.5)' //"rgba(30,30,30,50)";
  var borderWidth = '2'
  var fontColor = 'rgba(30,30,30,255)'
  var fontName = '宋体'
  var maxTextLength = 0
  var str = ''
  for (var i = 0; i < colorMap.length; i++) {
    if (maxTextLength < colorMap[i][3].length) {
      maxTextLength = colorMap[i][3].length
      str = colorMap[i][3]
    }
  }

  var w = recSize.width + recMargins.left + recMargins.right
  w += legendPadding.left + legendPadding.right // +getWidth(str, fontSize);

  var h =
    colorMap.length * (recSize.height + recMargins.top + recMargins.bottom)
  h += legendPadding.top + legendPadding.bottom
  var c = document.createElement('canvas')
  c.width = w
  c.height = h
  var ctx = c.getContext('2d')

  ctx.font = fontSize + 'px ' + fontName
  w += ctx.measureText(str).width
  c.width = w
  ctx.beginPath()
  ctx.lineWidth = borderWidth
  ctx.strokeStyle = borderColor
  ctx.rect(0, 0, w, h)
  ctx.stroke()
  for (var i = 0; i < colorMap.length; i++) {
    var x = recMargins.left + legendPadding.left
    var y = (i + 1) * recMargins.top + i * (recSize.height + recMargins.bottom)
    y += legendPadding.top
    var color = colorMap[i][2]
    ctx.fillStyle =
      'rgba(' +
      color[0] +
      ',' +
      color[1] +
      ',' +
      color[2] +
      ',' +
      color[3] +
      ')'
    ctx.fillRect(x, y, recSize.width, recSize.height)

    ctx.fillStyle = fontColor
    ctx.font = fontSize + 'px ' + fontName
    ctx.fillText(
      colorMap[i][3],
      x + recSize.width + recMargins.right,
      y + fontSize * 0.8
    )
  }
  var imgData = ctx.getImageData(0, 0, w, h)

  for (var i = 0; i < imgData.data.length; i += 4) {
    if (
      imgData.data[i] == 0 &&
      imgData.data[i + 1] == 0 &&
      imgData.data[i + 2] == 0 &&
      imgData.data[i + 3] == 0
    ) {
      imgData.data[i] = bgColor[0]
      imgData.data[i + 1] = bgColor[1]
      imgData.data[i + 2] = bgColor[2]
      imgData.data[i + 3] = bgColor[3]
    }
  }
  ctx.putImageData(imgData, 0, 0)
  return {
    imageUrl: c.toDataURL(),
    width: c.width,
    height: c.height,
    canvas: c,
  }
}

/**
 *画垂直布局且无间隔的图例，返回图例图片
 *@param {MeteoLib.Render.GridDataColorMap} colorMap
 *@param {String} title
 *@param {Number} recSize
 *@param {Number} legendSize
 *@param {Object} recMargins
 *@param {Number} recMargins.left
 *@param {Number} recMargins.right
 *@param {Number} recMargins.top
 *@param {Number} recMargins.bottom
 *@param {Object} legendPadding
 *@param {Number} legendPadding.left
 *@param {Number} legendPadding.right
 *@param {Number} legendPadding.top
 *@param {Number} legendPadding.bottom
 *@param {Number} fontSize
 *@returns {Object} imageObj
 *@returns {String} imageObj.imageUrl
 *@returns {Number} imageObj.width
 *@returns {Number} imageObj.height
 *@memberof MeteoLib.Render.GridDataColorMap
 */
GridDataColorMap.getLegendEx = function (
  colorMap,
  title,
  recSize,
  legendSize,
  recMargins,
  legendPadding,
  fontSize
) {
  /* if (colorMap[0][0] < colorMap[colorMap.length - 1][0]) {
        colorMap.reverse();
    }*/
  if (recSize == undefined) recSize = { width: 20, height: 9 }
  if (recMargins == undefined)
    recMargins = { left: 10, right: 5, top: 0, bottom: 0 }
  if (legendPadding == undefined)
    legendPadding = { left: 0, right: 10, top: 5, bottom: 5 }
  if (fontSize == undefined) {
    fontSize = recSize.height
  }

  var bgColor = [230, 230, 230, 255]
  var borderColor = 'rgba(85,150,220,0.5)' //30,30,30,50)";
  var borderWidth = '2'
  var fontColor = 'rgba(30,30,30,255)'
  var fontName = '宋体'
  var maxTextLength = 0
  var str = ''
  for (var i = 0; i < colorMap.length; i++) {
    if (maxTextLength < colorMap[i][3].length) {
      maxTextLength = colorMap[i][3].length
      str = colorMap[i][3]
    }
  }

  var w = recSize.width + recMargins.left + recMargins.right
  w += legendPadding.left + legendPadding.right // +getWidth(str, fontSize);

  var h =
    colorMap.length * (recSize.height + recMargins.top + recMargins.bottom)
  h += legendPadding.top + legendPadding.bottom
  var c = document.createElement('canvas')
  c.width = w
  c.height = h
  var ctx = c.getContext('2d')

  ctx.font = fontSize + 'px ' + fontName
  var textSize = ctx.measureText(str)
  w += textSize.width
  var titleH = 0
  if (title) {
    textSize = ctx.measureText('中')
    titleW = ctx.measureText(title).width
    if (w < titleW) {
      w = titleW
    }
    titleH = textSize.width * 1.5
    h += titleH
    c.height = h
  }

  c.width = w
  ctx.beginPath()
  ctx.lineWidth = borderWidth
  ctx.strokeStyle = borderColor
  ctx.rect(0, 0, w, h)
  ctx.stroke()
  if (title) {
    ctx.fillStyle = fontColor
    ctx.font = fontSize + 'px ' + fontName
    ctx.fillText(
      title,
      recMargins.left / 2 + legendPadding.left,
      titleH * 0.6 + legendPadding.top
    )
  }

  for (var i = 0; i < colorMap.length; i++) {
    var x = recMargins.left + legendPadding.left
    var y = (i + 1) * recMargins.top + i * (recSize.height + recMargins.bottom)
    y += legendPadding.top + titleH
    var color = colorMap[i][2]
    ctx.fillStyle =
      'rgba(' +
      color[0] +
      ',' +
      color[1] +
      ',' +
      color[2] +
      ',' +
      color[3] +
      ')'
    ctx.fillRect(x, y, recSize.width, recSize.height)

    ctx.fillStyle = fontColor
    ctx.font = fontSize + 'px ' + fontName
    ctx.fillText(
      colorMap[i][3],
      x + recSize.width + recMargins.right,
      y + fontSize * 0.8
    )
  }
  var imgData = ctx.getImageData(0, 0, w, h)

  for (var i = 0; i < imgData.data.length; i += 4) {
    if (
      imgData.data[i] == 0 &&
      imgData.data[i + 1] == 0 &&
      imgData.data[i + 2] == 0 &&
      imgData.data[i + 3] == 0
    ) {
      imgData.data[i] = bgColor[0]
      imgData.data[i + 1] = bgColor[1]
      imgData.data[i + 2] = bgColor[2]
      imgData.data[i + 3] = bgColor[3]
    }
  }
  ctx.putImageData(imgData, 0, 0)
  return {
    imageUrl: c.toDataURL(),
    width: c.width,
    height: c.height,
    canvas: c,
  }
}

/**
 *图例自动生成工具类
 *@constructor
 *@memberof MeteoLib.Render.GridDataColorMap
 */
function GenerateColorMap() {
  if (typeof document == 'undefined') {
    return {}
  }
  var colorArr = {}
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')

  /**
   *提取图片中指定行或者列的颜色，自动生成图例数据
   *@param {String} imgUrl 图片路径
   *@param {Number} min 图例所表示数据范围的最小值
   *@param {Number} max 图例所表示数据范围的最大值
   *@param {Number} count 图例所表示数据范围分段数
   *@param {Number} unit 图例所表示数据单位
   *@param {Boolean} byRow 指示是否提取按行提取，true则提取中间图像中间行颜色，false则提取中间列颜色，
   *不传或者为undefined则根据图像宽高比决定（宽最大则按提取中间行，高最大则提取中间列）
   *@return {Promise.<GenerateColorMap>}
   */
  this.fromImage = function (imgUrl, min, max, count, unit, byRow) {
    /// <summary>提取图片中指定行或者列的颜色，自动生成图例数据</summary>
    /// <param name="imgUrl" type="String">图片路径</param>
    /// <param name="min" type="Number">图例所表示数据范围的最小值</param>
    /// <param name="max" type="Number">图例所表示数据范围的最大值</param>
    /// <param name="count" type="Number">图例所表示数据范围分段数</param>
    /// <param name="unit" type="Number">图例所表示数据单位</param>
    /// <param name="byRow" type="Boolean">指示是否提取按行提取，true则提取中间图像中间行颜色，false则提取中间列颜色，
    ///不传或者为undefined则根据图像宽高比决定（宽最大则按提取中间行，高最大则提取中间列）
    /// </param>
    var that = this

    return new Promise(function (resove, reject) {
      var image = new Image()
      image.src = imgUrl
      image.onload = function () {
        // image onload start

        var img_width = this.width
        var img_height = this.height
        if (byRow == undefined) {
          if (img_width > img_height) {
            byRow = true
          } else {
            byRow = false
          }
        }

        if (!byRow) {
          that
            .getColorFromImgByCol(
              imgUrl,
              [
                [0, 0, 0],
                [255, 255, 255],
              ],
              14,
              19
            )
            .then(function (colorArr) {
              var legendData = that.separateColoByMinMax(
                colorArr,
                min,
                max,
                count,
                unit
              )
              var colorMap = []
              for (var i = 0; i < legendData.length; i++) {
                var point = legendData[i]
                colorMap[i] = [
                  point.min - 0.01,
                  point.max,
                  point.color,
                  point.descr,
                ]
              }
              resove(colorMap)
            })
        } else {
          that
            .getColorFromImgByRow(imgUrl, [
              [0, 0, 0, 255],
              [255, 255, 255],
            ])
            .then(function (colorArr) {
              var legendData = that.separateColoByMinMax(
                colorArr,
                min,
                max,
                count,
                unit
              )
              var colorMap = []
              for (var i = 0; i < legendData.length; i++) {
                var point = legendData[i]
                colorMap[i] = [
                  point.min - 0.01,
                  point.max,
                  point.color,
                  point.descr,
                ]
              }
              resove(colorMap)
            })
        }
      }
    })
  }
  /**
   *
   *@param {Array.<Number>} colorArr
   *@param {Number} min
   *@param {Number} max
   *@param {Number} count
   *@param {String} unit
   */
  this.separateColoByMinMax = function (colorArr, min, max, count, unit) {
    var ResultPoint = function (unit, min, max, color, decsr) {
      this.unit = unit != undefined ? unit : 'k'
      this.min = min != undefined ? min : Number.MIN_VALUE
      this.max = max != undefined ? max : Number.MAX_VALUE
      this.color = color != undefined ? color : [0, 0, 0, 255]
      this.descr =
        decsr != undefined
          ? decsr
          : this.min.toFixed(2) /*+ "~" + this.max.toFixed(2) +*/ + this.unit
    }
    var colorStepLen = parseInt(colorArr.length / count)
    var minMaxStepLen = (max - min) / count
    var result = []

    max = min + minMaxStepLen
    for (var i = 0; i < count; i++) {
      var colorIndex = i * colorStepLen + 1
      if (colorIndex > colorArr.length) {
        colorIndex = colorArr.length - 1
      }
      var color = colorArr[colorIndex]
      var point = new ResultPoint(unit, min, max, color)
      max += minMaxStepLen
      min += minMaxStepLen
      result.push(point)
    }

    return result
  }
  /**
   *
   *@param {String} imgUrl
   *@param {Array.<Number>} ignoreColors rgba
   *@param {Number} startColOffset
   *@param {Number} endColOffset
   *@param {Number} rowNumber
   *@return {Promise.<Array.<Number>>}
   */
  this.getColorFromImgByRow = function (
    imgUrl,
    ignoreColors,
    startColOffset,
    endColOffset,
    rowNumber
  ) {
    return new Promise(function (resolve, reject) {
      var image = new Image()
      image.src = imgUrl
      image.onload = function () {
        // image onload start

        var img_width = this.width
        var img_height = this.height

        startColOffset = startColOffset != undefined ? startColOffset : 12
        endColOffset = endColOffset != undefined ? endColOffset : 12
        rowNumber =
          rowNumber != undefined ? rowNumber : parseInt(img_height / 2)

        // 设置画布尺寸
        canvas.width = img_width
        canvas.height = img_height

        // 将图片按像素写入画布
        context.drawImage(this, 0, 0, img_width, img_height)

        // 读取图片像素信息
        var imageData = context.getImageData(0, 0, img_width, img_height)

        var arrbox = [],
          length = imageData.data.length
        colorArr = []

        var start = parseInt(rowNumber) * img_width * 4 + startColOffset * 4
        var end = (rowNumber + 1) * img_width * 4 - endColOffset * 4

        var colorNumber = {}
        for (var i = start; i < end; i++) {
          if (i % 4 === 0) {
            // 每四个元素为一个像素数据 r,g,b,alpha
            var color = [
              imageData.data[i],
              imageData.data[i + 1],
              imageData.data[i + 2],
              imageData.data[i + 3],
            ]

            var bIn = false
            for (var ign_i = 0; ign_i < ignoreColors.length; ign_i++) {
              var tempColor = ignoreColors[ign_i]
              var len =
                tempColor.length > color.length
                  ? color.length
                  : tempColor.length
              bIn = true
              for (var rgb_i = 0; rgb_i < len; rgb_i++) {
                if (tempColor[rgb_i] != color[rgb_i]) {
                  bIn = false
                  break
                }
              }
              if (bIn) {
                break
              }
            }

            if (!bIn) {
              colorArr.push(color)
            }
          }
        }
        resolve(colorArr)
      }
    })
  }
  /**
   *
   *@param {String} imgUrl
   *@param {Array.<Number>} ignoreColors rgba
   *@param {Number} startRowOffset
   *@param {Number} endRowOffset
   *@param {Number} colNumber
   *@return {Promise.<Array.<Number>>}
   */
  this.getColorFromImgByCol = function (
    imgUrl,
    ignoreColors,
    startRowOffset,
    endRowOffset,
    colNumber
  ) {
    return new Promise(function (resolve, reject) {
      var image = new Image()
      image.src = imgUrl
      image.onload = function () {
        // image onload start

        var img_width = this.width
        var img_height = this.height
        ignoreColors = ignoreColors != undefined ? ignoreColors : []
        startRowOffset = startRowOffset != undefined ? startRowOffset : 10
        endRowOffset = endRowOffset != undefined ? endRowOffset : 12
        colNumber = colNumber != undefined ? colNumber : parseInt(img_width / 2)

        // 设置画布尺寸
        canvas.width = img_width
        canvas.height = img_height

        // 将图片按像素写入画布
        context.drawImage(this, 0, 0, img_width, img_height)

        // 读取图片像素信息
        var imageData = context.getImageData(0, 0, img_width, img_height)

        var arrbox = [],
          length = imageData.data.length
        colorArr = []

        var start = startRowOffset
        var end = img_height - endRowOffset

        for (var i = start; i < end; i++) {
          var pos = (i * img_width + colNumber) * 4
          var color = [
            imageData.data[pos],
            imageData.data[pos + 1],
            imageData.data[pos + 2],
            imageData.data[pos + 3],
          ]
          var bIn = false
          for (var ign_i = 0; ign_i < ignoreColors.length; ign_i++) {
            var tempColor = ignoreColors[ign_i]
            var len =
              tempColor.length > color.length ? color.length : tempColor.length
            bIn = true
            for (var rgb_i = 0; rgb_i < len; rgb_i++) {
              if (tempColor[rgb_i] != color[rgb_i]) {
                bIn = false
                break
              }
            }
            if (bIn) {
              break
            }
          }
          if (!bIn) {
            colorArr.push(color)
          }
        }

        resolve(colorArr)
      }
    })
  }
}

/**
 *
 *@Object GridDataColorMap.generateColorMap
 * @type {MeteoLib.Render.GridDataColorMap.GenerateColorMap}
 *@memberof MeteoLib.Render.GridDataColorMap
 */
GridDataColorMap.generateColorMap = new GenerateColorMap()

/**
 *提取图片中指定行或者列的颜色，自动生成图例数据
 *@param {String} imgUrl 图片路径
 *@param {Number} min 图例所表示数据范围的最小值
 *@param {Number} max 图例所表示数据范围的最大值
 *@param {Number} count 图例所表示数据范围分段数
 *@param {Number} unit 图例所表示数据单位
 *@param {Boolean} byRow 指示是否提取按行提取，true则提取中间图像中间行颜色，false则提取中间列颜色，
 *不传或者为undefined则根据图像宽高比决定（宽最大则按提取中间行，高最大则提取中间列）
 *@return {Promise.<GenerateColorMap>}
 *@memberof MeteoLib.Render.GridDataColorMap
 *@method fromImage
 *@static
 */
GridDataColorMap.fromImage = function (imgUrl, min, max, count, unit, byRow) {
  return GridDataColorMap.generateColorMap.fromImage(
    imgUrl,
    min,
    max,
    count,
    unit,
    byRow
  )
}
/**
 *生成图例缩略图
 *@param {MeteoLib.Render.GridDataColorMap}colorMap
 *@param {Number}width
 *@param {Number}height
 */
GridDataColorMap.getOverview = function (colorMap, width, height) {
  var canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  var oCan = canvas.getContext('2d')
  var total = colorMap[colorMap.length - 1][1] - colorMap[0][0] // frostyen 2018-12-26 渐变色不能平均	 总的范围
  var rate = 0
  var color = oCan.createLinearGradient(
    0,
    0,
    width,
    0
  ) /* 线性渐变 :渐变的起止位置 */
  for (var i = 0; i < colorMap.length; i++) {
    var clr = colorMap[i][2]
    clr = Cesium.Color.fromBytes(
      clr[0],
      clr[1],
      clr[2],
      clr[3]
    ).toCssColorString()
    //color.addColorStop(i / colorMap.length, clr);
    rate += colorMap[i][1] - colorMap[i][0]
    color.addColorStop(rate / total, clr) // frostyen 2018-12-26 渐变色不能平均 因为色标取值并不平均
  }
  oCan.fillStyle =
    color /* 请注意 : fillStyle 填充样式这个属性不仅可以设置颜色还可以设置背景图片 */
  oCan.fillRect(0, 0, canvas.width, canvas.height)

  return canvas
}

export default GridDataColorMap
