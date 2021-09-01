export const nearInterp =
  '\n\
//邻近插值\n\
    float radar_nearInterp(vec3 polarCoords){\n\
    \n\
        int minZ, maxZ;\n\
        float minElev, maxElev;\n\
        radar_getElevRange(polarCoords.z, minZ, maxZ, minElev, maxElev);\n\
        float d = polarCoords.z - float(minZ);\n\
        vec4 color;\n\
        if (d < 0.5) color = radar_sampleData(polarCoords.x, polarCoords.y, minZ);\n\
        else color = radar_sampleData(polarCoords.x, polarCoords.y, maxZ);\n\
        if (color.a == 0.0) return -999.0;\n\
        else return radar_decode(color);\n\
    }\n\
'
