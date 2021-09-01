export const radar_interp_vert =
  '\n\
                        attribute vec3 position; \n\
                        varying vec3 v_position; \n\
                        void main()\n\
                        {\n\
                            v_position=position;\n\
                            gl_Position =vec4( position, 1.0 ); \n\
                        }'
