export const radar_sampleGrid3DData =
  '\n\
                     vec4 radar_sampleGrid3DData(vec3 dstSt,sampler2D srcData,vec2 srcDataSize,vec3 srcDimensions){\n\
                         vec3 coords=dstSt*(srcDimensions-1.0);\n\
                         float w = srcDataSize.x, \n\
                               h = srcDataSize.y;\n\
                         int cols = int(w/srcDimensions.x);//横排图片个数\n\
                     \n\
                         int img_row=int((coords.z)/float(cols ));\n\
                         int img_col=int(mod(coords.z,float(cols )));\n\
                     \n\
                         float yIndex=float(img_row)* srcDimensions.y +coords.y;\n\
                         float xIndex=float(img_col)* srcDimensions.x +coords.x;\n\
                     \n\
                         vec2 st=vec2(xIndex/(w-1.0),1.0-yIndex/(h-1.0));\n\
                         return texture2D(srcData,st);\n\
                     }'
