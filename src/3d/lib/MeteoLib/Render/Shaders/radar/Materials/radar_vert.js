export const radar_vert =
  '#ifdef USE_NORMAL\n\
                        attribute vec3 position; \n\
                        varying vec3 v_position;\n\
                    \n\
                        uniform mat4 projectionMatrix;\n\
                        uniform mat4 modelViewMatrix;\n\
                        void main()\n\
                        {\n\
                            v_position=position;\n\
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); \n\
                        }\n\
                     #endif\n\
                    \n\
                     #ifdef USE_VOLUME\n\
                        attribute vec3 position;\n\
                        varying vec3 worldSpaceCoords;\n\
                        varying vec4 projectedCoords;\n\
                        uniform mat4 projectionMatrix;\n\
                        uniform mat4 modelViewMatrix;\n\
                        uniform vec3 dimensions;\n\
                    \n\
                        void main()\n\
                        {\n\
                            gl_Position = projectionMatrix *  modelViewMatrix * vec4( position, 1.0 );\n\
                            projectedCoords =  projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\
                            worldSpaceCoords=(position+dimensions/2.0)/dimensions;\n\
                        }\n\
                     #endif'
