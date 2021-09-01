export const radar_decode =
  '\n\
    //解码\n\
        float radar_decode(vec4 code){\n\
            if (code.a == 0.0) return 0.0;\n\
            float val = (code.r * 255.0 - offset) / scale;\n\
            if (val < min) val = min;\n\
            if (val > max) val = max;\n\
            return val;\n\
    }'
