export const parallel_getCoords =
  '\n\
        vec3 parallel_getCoords(vec3 st,vec3 shape){\n\
            float x=st.x*(shape.x-1.0),\n\
            y=st.y*(shape.x-1.0),\n\
            z=shape.z==0.0?0.0: st.z*(shape.z-1.0);\n\
            return vec3(x,y,z);           \n\
     }'
