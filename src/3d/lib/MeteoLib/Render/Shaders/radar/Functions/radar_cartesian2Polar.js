export const radar_cartesian2Polar =
  '\n\
    vec3   radar_cartesian2Polar(vec3 cartesian3) {\n\
        \n\
        vec3 result = vec3(-1.0, -1.0, -1.0);\n\
        float elev, azimuth, polarDistance;\n\
        \n\
        float xDistance = cartesian3.x;\n\
        float yDistance = cartesian3.y;\n\
        float zDistance = cartesian3.z;\n\
        float lonlatDistance = sqrt(pow(xDistance, 2.0) + pow(yDistance, 2.0));\n\
        \n\
        azimuth = atan(xDistance, yDistance);\n\
        azimuth = degrees(azimuth);\n\
        if (azimuth < 0.0) {\n\
            azimuth = 360.0 + azimuth;\n\
        }\n\
        \n\
        elev = degrees(atan(zDistance, lonlatDistance));\n\
        polarDistance = sqrt(pow(lonlatDistance, 2.0) + pow(zDistance, 2.0));\n\
        \n\
        result.z = elev;\n\
        result.y = azimuth;\n\
        result.x = polarDistance / gateSizeOfReflectivity;\n\
        if (result.x > rGates || elev < radar_getElevation(0.0) - 0.1 || elev > radar_getElevation(layerCount - 1.0)) {\n\
            //discard;       \n\
            result.x = -1.0;\n\
            result.y = -1.0;\n\
            result.z = -1.0;\n\
        }\n\
        return result;\n\
    }'
