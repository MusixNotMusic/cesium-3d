import * as Cesium from 'cesium'
/**
     *turfjs是一个用于空间分析的JavaScript库。它包括传统的空间操作，用于创建GeoJSON数据的帮助函数，以及数据分类和统计工具。
     *详细说明请看官方文档{@link http://turfjs.org/docs/}
     *@class  turf
     *@memberof MeteoLib.Util
     */

 /**
  * 计算面积，多边形用geojson polygon存储和表示，计算结果单位为平方米(m^2)
  * @method 
  * @name area
  * @static
  * @memberof MeteoLib.Util.turf
  * @param {(Feature|FeatureCollection)} input geojson表达的地理空间要素（集合）
  * @return {number} area 面积，单位为平方米(m^2)
  * @example
  * var polygons = {
  *   "type": "FeatureCollection",
  *   "features": [
  *     {
  *       "type": "Feature",
  *       "properties": {},
  *       "geometry": {
  *         "type": "Polygon",
  *         "coordinates": [[
  *           [-67.031021, 10.458102],
  *           [-67.031021, 10.53372],
  *           [-66.929397, 10.53372],
  *           [-66.929397, 10.458102],
  *           [-67.031021, 10.458102]
  *         ]]
  *       }
  *     }, {
  *       "type": "Feature",
  *       "properties": {},
  *       "geometry": {
  *         "type": "Polygon",
  *         "coordinates": [[
  *           [-66.919784, 10.397325],
  *           [-66.919784, 10.513467],
  *           [-66.805114, 10.513467],
  *           [-66.805114, 10.397325],
  *           [-66.919784, 10.397325]
  *         ]]
  *       }
  *     }
  *   ]
  * };
  *
  * var area = MeteoLib.Util.turf.area(polygons);
  *
  * //=area
  */
  turf.turfTaskProcessor = new Cesium.TaskProcessor('turfWorker', 2);
  turf.turfTaskProcessor.execute = function (methodName,args) {
      return turf.turfTaskProcessor.scheduleTask({
          methodName: methodName,
          args: args
      });
  }
  for (var i in turf2) {
      if (!turf[i]) {
          turf[i] = turf2[i];
      } 
  }
  export default turf;