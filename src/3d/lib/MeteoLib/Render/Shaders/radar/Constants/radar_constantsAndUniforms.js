export const radar_constantsAndUniforms =
  '\n\
    const float PI = czm_pi;\n\
    const int max_layerCount = 20;\n\
    uniform sampler2D tex;\n\
    uniform float layerCount;\n\
    uniform float rCount;\n\
    uniform float gateSizeOfReflectivity;\n\
    uniform float rGates;\n\
    uniform float elevationArray[max_layerCount];\n\
    uniform float offset; \n\
    uniform float scale;\n\
    uniform  sampler2D texTransform;\n\
    uniform float min;\n\
    uniform float max;\n\
    uniform float granularity;\n\
    uniform vec2 elevationRange;'
