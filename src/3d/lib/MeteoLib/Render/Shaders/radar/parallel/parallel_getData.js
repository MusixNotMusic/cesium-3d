export const parallel_getData =
  '\n\
float parallel_getData(sampler2D inputData,vec3 shape,float x){\n\
	vec2 st=vec2(x/shape.x,0.0);                      \n\
    return texture2D(inputData,st).a;                     \n\
}\n\
 \n\
float parallel_getData(sampler2D inputData,vec3 shape,float x,float y){\n\
	vec2 st=vec2(x/shape.x,y/shape.y);\n\
    return texture2D(inputData,st).a;\n\
}\n\
 \n\
float parallel_getData(sampler2D inputData,vec3 shape,float x,float y,float z){\n\
	vec2 st=vec2(x /(shape.x-1.0),( (z *shape.y)+y)/( shape.y * shape.z-1.0));\n\
return texture2D(inputData,st).a;\n\
}\n\
float parallel_getData(sampler2D inputData,vec3 shape,vec3 p){\n\
	vec2 st=vec2(p.x/shape.x,((p.z*shape.y)+p.y)/(shape.y*shape.z));  \n\
    return texture2D(inputData,st).a;\n\
}\n\
vec4 parallel_getData(sampler2D inputData,vec3 shape,vec3 p,bool rgba){\n\
    vec2 st=vec2(p.x/shape.x,((p.z*shape.y)+p.y)/(shape.y*shape.z));  \n\
    return texture2D(inputData,st);\n\
}\n'
