export const radar_sampleData =
  '\n\
// x:径向索引， y:方位角索引， z:仰角索引\n\
    vec4 radar_sampleData(int x, int y, int z){\n\
        vec2 st = vec2(float(x) / rGates, 1.0 - (float(z) * rCount + float(y)) / (rCount * layerCount));\n\
        return texture2D(tex, st);\n\
    }\n\
    // x:径向索引， y:方位角索引， z:仰角索引\n\
    vec4 radar_sampleData(float x, float y, int z){\n\
        vec2 st = vec2(x / rGates, 1.0 - (float(z) * rCount + y) / (rCount * layerCount));\n\
        return texture2D(tex, st);\n\
    }\n'
