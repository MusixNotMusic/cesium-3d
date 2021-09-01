/**
 *
 *在shader中定义了一组用于操作雷达基数据的函数
 *1、sampleRadar3DTexture 获取雷达空间中给定点的雷达数值对应的颜色
 *定义:  vec4 sampleRadar3DTexture(vec3 cartesian3){
 *参数解释：
 *（1）cartesian3 坐标点。直角坐标系，以雷达站位置为中心，向东向北向上为正
 *（2）返回值 返回雷达数值在图例中相应的颜色
 *2、radar_cartesian2Polar 雷达空间直角坐标转球坐标
 *定义:  vec3 radar_cartesian2Polar(vec3 cartesian3){
 *参数解释：
 *（1）cartesian3 坐标点。直角坐标系，以雷达站位置为中心，向东向北向上为正
 *（2）返回值 返回给定雷达空间直角坐标系点对应球坐标系的坐标
 *3、nearInterp 邻近插值
 *定义：float nearInterp(vec3 polarCoords)
 *参数解释：
 *（1) polarCoords 坐标点。雷达球坐标系，以雷达站位置为中心，x分量为仰角，以向上为正；y分量为方位角，正北为0度，顺时针为正；z分量为径向库数。
 *（2） 返回值 返回给定点对应插值后的数值
 *4、radar_epiInterp 8点插值法插值
 *定义：float radar_epiInterp(vec3 polarCoords)
 *参数解释：
 *（1) polarCoords 坐标点。雷达球坐标系，以雷达站位置为中心，x分量为仰角，以向上为正；y分量为方位角，正北为0度，顺时针为正；z分量为径向库数。
 *（2） 返回值 返回给定点对应插值后的数值
 *@memberof MeteoLib.Render.ShaderChunk
 *@name radar_sample3DTexture
 *@static
 */
export const radar_sample3DTexture =
  '\n\
    //雷达部分\n\
        #include <radar_constantsAndUniforms>\n\
        #include <radar_getElevation>\n\
        #include <radar_cartesian2Polar>\n\
        #include <radar_decode>\n\
        #include <radar_getElevRange>\n\
        #include <radar_sampleData>\n\
        #include <radar_linearInterp>\n\
        #include <radar_epiInterp>\n\
        #include <radar_nearInterp>\n\
        \n\
            /**\n\
            *\n\
            *@param {vec3}cartesian3 坐标点。直角坐标系，以雷达站位置为中心，向东向北向上为正\n\
            *@return {vec4} 返回颜色\n\
            */\n\
            vec4 radar_sample3DTexture(vec3 cartesian3){\n\
            //笛卡尔坐标转极坐标\n\
            vec3 polarCoords = radar_cartesian2Polar(cartesian3);\n\
            if (polarCoords.x == -1.0 && polarCoords.x == -1.0 && polarCoords.x == -1.0)\n\
                return vec4(0.0);\n\
            //8点插值\n\
            float val = radar_epiInterp(polarCoords);\n\
            if (val == -999.0)\n\
                return vec4(0.0);\n\
            //从图例中查找颜色\n\
            vec2 val_st = vec2((val - min) / (max - min), 0.5);\n\
            vec4 color = texture2D(texTransform, val_st);\n\
            return color;\n\
        }'
