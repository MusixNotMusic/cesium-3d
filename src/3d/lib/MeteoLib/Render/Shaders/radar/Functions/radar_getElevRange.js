export const radar_getElevRange =
  '\n\
//根据给定仰角计算该仰角的范围（判断处于那两个仰角层之间）\n\
void radar_getElevRange(float elevationOut, out int minElevIndex, out int maxElevIndex, out float minElev, out float maxElev){\n\
    minElevIndex = -1; \n\
    maxElevIndex = -1; \n\
    minElev = -1.0; \n\
    maxElev = -1.0; \n\
    if (elevationOut <= elevationArray[0]) {\n\
        maxElevIndex = 0;\n\
        minElevIndex = 0;\n\
        minElev = elevationArray[0];\n\
        maxElev = elevationArray[0];\n\
    } else {                        \n\
        float fl_i = 0.;            \n\
        for (int i = 1; i < max_layerCount ; i += 1) {\n\
            if (elevationArray[i] >= elevationOut && elevationArray[i - 1] <= elevationOut) {\n\
                maxElevIndex = i;\n\
                minElevIndex = i - 1;\n\
                minElev = elevationArray[i - 1];\n\
                maxElev = elevationArray[i];\n\
                break;\n\
            }\n\
            \n\
            if (fl_i >= layerCount - 1.0) {\n\
                maxElevIndex = i;\n\
                minElevIndex = i;\n\
                minElev = elevationArray[i];\n\
                maxElev = elevationArray[i];\n\
                break;\n\
            }\n\
            fl_i += 1.0;\n\
        }\n\
    }        \n\
}'
