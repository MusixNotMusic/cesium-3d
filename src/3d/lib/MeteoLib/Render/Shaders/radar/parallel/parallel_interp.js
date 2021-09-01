export const parallel_interp =
  '\n\
float parallel_interp(sampler2D inputData,vec3 shape,float x) {              \n\
    float ix =  floor(x),                                             \n\
	      fx = x - ix;                                                \n\
bool s0 = 0.0 <= ix && ix <  shape.x,                                 \n\
     s1 = (0.0 <= ix + 1.0) && (ix + 1.0 <  shape.x);                 \n\
float w0 = s0 ? + parallel_getData(inputData,shape,ix) : 0.0,                  \n\
     w1 = s1 ? + parallel_getData(inputData,shape,ix + 1.0): 0.0;              \n\
return (1.0 - fx) * w0 + fx * w1;                                     \n\
}                                                                     \n\
                                                                      \n\
float parallel_interp(sampler2D inputData,vec3 shape,float x,float y) {      \n\
    float ix =  floor(x)                                              \n\
        , fx = x - ix;                                                \n\
bool s0 = 0. <= ix && ix <  shape.x                                   \n\
    , s1 = 0. <= ix + 1. && ix + 1. <  shape.x;                       \n\
float iy =  floor(y)                                                  \n\
    , fy = y - iy;                                                    \n\
bool t0 = 0. <= iy && iy <  shape.y                                   \n\
, t1 = 0. <= iy + 1. && iy + 1. <  shape.y;                           \n\
float w00 = s0 && t0 ?  parallel_getData(inputData,shape,ix, iy) : 0.0         \n\
, w01 = s0 && t1 ?  parallel_getData(inputData,shape,ix, iy + 1.) : 0.0        \n\
, w10 = s1 && t0 ?  parallel_getData(inputData,shape,ix + 1., iy) : 0.0        \n\
, w11 = s1 && t1 ?  parallel_getData(inputData,shape,ix + 1., iy + 1.) : 0.0;  \n\
return (1.0 - fy) * ((1.0 - fx) * w00 + fx * w10) + fy * ((1.0 - fx) * w01 + fx * w11);\n\
}\n\
\n\
float parallel_interp(sampler2D inputData,vec3 shape,float x,float  y,float  z) {\n\
    float ix =  floor(x)                                                  \n\
        , fx = x - ix;                                                    \n\
bool s0 = 0. <= ix && ix <  shape.x                                       \n\
, s1 = 0. <= ix + 1. && ix + 1. <  shape.x;                               \n\
float iy = floor(y)                                                       \n\
, fy = y - iy;                                                            \n\
bool t0 = 0. <= iy && iy <  shape.y                                       \n\
, t1 = 0. <= iy + 1. && iy + 1. <  shape.y;                               \n\
float iz =  floor(z)                                                      \n\
, fz = z - iz;                                                            \n\
bool u0 = 0. <= iz && iz < shape.y                                        \n\
, u1 = 0. <= iz + 1. && iz + 1. < shape.y;                                \n\
float w000 = s0 && t0 && u0 ? parallel_getData(inputData,shape,ix, iy, iz) : 0.0   \n\
, w010 = s0 && t1 && u0 ?  parallel_getData(inputData,shape,ix, iy + 1., iz) : 0.0 \n\
, w100 = s1 && t0 && u0 ?  parallel_getData(inputData,shape,ix + 1., iy, iz) : 0.0 \n\
, w110 = s1 && t1 && u0 ?  parallel_getData(inputData,shape,ix + 1., iy + 1., iz) : 0.0\n\
, w001 = s0 && t0 && u1 ?  parallel_getData(inputData,shape,ix, iy, iz + 1.) : 0.0     \n\
, w011 = s0 && t1 && u1 ?  parallel_getData(inputData,shape,ix, iy + 1., iz + 1.) : 0.0\n\
, w101 = s1 && t0 && u1 ?  parallel_getData(inputData,shape,ix + 1., iy, iz + 1.) : 0.0\n\
, w111 = s1 && t1 && u1 ?  parallel_getData(inputData,shape,ix + 1., iy + 1., iz + 1.) : 0.0;\n\
return (1.0 - fz) * ((1.0 - fy) * ((1.0 - fx) * w000 + fx * w100) + fy * ((1.0 - fx) * w010 + fx * w110)) + fz * ((1.0 - fy) * ((1.0 - fx) * w001 + fx * w101) + fy * ((1.0 - fx) * w011 + fx * w111));\n\
}\n\
float parallel_interp(sampler2D inputData,vec3 shape, vec2 p) {\n\
   return parallel_interp(inputData,shape,p.x,p.y);\n\
\n\
}\n\
float parallel_interp(sampler2D inputData,vec3 shape,vec3 p) {\n\
   return parallel_interp(inputData,shape,p.x,p.y,p.z);\n\
\n\
}\n'
