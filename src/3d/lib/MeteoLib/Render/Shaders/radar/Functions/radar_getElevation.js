export const radar_getElevation =
  '\n\
float radar_getElevation(float index){\n\
    for (int i = 0; i < max_layerCount ; i += 1) {\n\
        if (index == float(i)) {\n\
            return elevationArray[i];\n\
        }\n\
    }\n\
    return -999.0;\n\
}\n'
