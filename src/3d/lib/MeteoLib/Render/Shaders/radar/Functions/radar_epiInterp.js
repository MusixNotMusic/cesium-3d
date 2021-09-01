export const radar_epiInterp =
  '\n\
//8点插值法插值\n\
    float radar_epiInterp(vec3 polarCoords){\n\
        float x[2], y[2];\n\
        int z[2];\n\
        int minZ, maxZ;\n\
        float minElev, maxElev;\n\
        radar_getElevRange(polarCoords.z, minZ, maxZ, minElev, maxElev);\n\
    \n\
        x[0] = polarCoords.x - granularity;\n\
        x[1] = polarCoords.x + granularity;\n\
        y[0] = polarCoords.y - granularity;\n\
        y[1] = polarCoords.y + granularity;\n\
        z[0] = minZ;\n\
        z[1] = maxZ;\n\
\n\
        vec4 color1, color2;\n\
        float val;\n\
        float count = 0.0;\n\
    \n\
        float fcvy1 = 0.0, fcvy2 = 0.0, fcvy3 = 0.0, fcvy4 = 0.0;\n\
        float d1 = polarCoords.x - float(x[0]);\n\
    \n\
        count += radar_linearInterp(\n\
            x[0], y[0], z[1],\n\
            x[1], y[0], z[1],\n\
            d1, fcvy1\n\
        );\n\
        count += radar_linearInterp(\n\
            x[0], y[0], z[0], \n\
            x[1], y[1], z[0], \n\
            d1, fcvy2         \n\
        );                    \n\
        count += radar_linearInterp(\n\
            x[0], y[0], z[1], \n\
            x[1], y[0], z[1], \n\
            d1, fcvy3         \n\
        );                    \n\
        count += radar_linearInterp(\n\
            x[0], y[0], z[0], \n\
            x[1], y[1], z[0], \n\
            d1, fcvy4         \n\
        );                    \n\
                              \n\
        float fcvy5, fcvy6;   \n\
        float d2 = polarCoords.y - float(y[0]);\n\
        fcvy5 = fcvy1 * d2 + (1.0 - d2) * fcvy3;\n\
        fcvy6 = fcvy2 * d2 + (1.0 - d2) * fcvy4;\n\
    \n\
        float d3 = (polarCoords.z - minElev) / (maxElev - minElev);\n\
        val = fcvy5 * d3 + fcvy6 * (1.0 - d3);\n\
        if (z[0] == z[1]) {\n\
            val = fcvy6;\n\
        }\n\
        if (count == 0.0) return -999.0;\n\
        return val;\n\
    }\n\
    /**\n\
    *\n\
    *@param {vec3}cartesian3 坐标点。直角坐标系，以雷达站位置为中心，向东向北向上为正\n\
    *@return {float} 返回雷达数据（反射率、径向速度、谱宽）\n\
    */\n\
    float radar_sampleData(vec3 cartesian3){\n\
        //笛卡尔坐标转极坐标\n\
        vec3 polarCoords = radar_cartesian2Polar(cartesian3);\n\
        if (polarCoords.x == -1.0 && polarCoords.x == -1.0 && polarCoords.x == -1.0)\n\
            -999.0;\n\
        //8点插值\n\
        float val = radar_epiInterp(polarCoords);\n\
        return val;\n\
    }\n\
    '
