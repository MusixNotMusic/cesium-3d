export const radar_linearInterp =
  '\n\
float radar_linearInterp(int x1, int y1, int z1, int x2, int y2, int z2, float d, out float val){\n\
 float count=0.0;\n\
                 \n\
val=0.0;      \n\
vec4 color1 =radar_sampleData(x1, y1, z1); \n\
vec4 color2 =radar_sampleData(x2,y2,z2);\n\
if(color1.a!=0.0){\n\
    val+=radar_decode(color1)*(1.0-d);\n\
    count++;\n\
}\n\
if(color2.a!=0.0){\n\
    val+=radar_decode(color2)* d;\n\
    count++;\n\
}           \n\
return count;\n\
}\n\
float radar_linearInterp(float x1,float y1,int z1,float x2,float y2,int z2,float d,out float val){\n\
 float count=0.0;\n\
                 \n\
val=0.0;             \n\
vec4 color1=radar_sampleData(x1,y1,z1);\n\
vec4 color2=radar_sampleData(x2,y2,z2);\n\
if(color1.a!=0.0){           \n\
val += radar_decode(color1) * (1.0 - d); \n\
count++; \n\
}  \n\
if(color2.a!=0.0){\n\
    val+=radar_decode(color2)* d;\n\
    count++;\n\
}\n\
return count; \n\
}\n'
