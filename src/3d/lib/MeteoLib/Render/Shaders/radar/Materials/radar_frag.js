export const radar_frag =
  '#include <radar_sample3DTexture> \n\
\n\
#ifdef USE_VOLUME\n\
    //体积渲染部分\n\
    varying vec3 worldSpaceCoords;\n\
    varying vec4 projectedCoords;\n\
    uniform sampler2D backTex;\n\
    uniform float steps;\n\
    uniform float alphaCorrection;\n\
    uniform vec3 dimensions;\n\
    uniform float alpha;\n\
\n\
    // The maximum distance through our rendering volume is sqrt(3).\n\
    // The maximum number of steps we take to travel a distance of 1 is 512.\n\
    // ceil( sqrt(3) * 512 ) = 887\n\
    // This prevents the back of the image from getting cut off when steps=512 & viewing diagonally.\n\
    const int MAX_STEPS = 887;\n\
\n\
    //Acts like a texture3D using Z slices and trilinear filtering.\n\
    vec4 sampleAs3DTexture( vec3 texCoord )\n\
    {  \n\
        vec3 cart3=vec3(vec3(texCoord.xy -0.5,texCoord.z)*dimensions);\n\
        return radar_sample3DTexture(cart3); \n\
    }\n\
 \n\
void main( void ) {\n\
\n\
	//Transform the coordinates it from [-1;1] to [0;1]\n\
	vec2 texc = vec2(((projectedCoords.x / projectedCoords.w) + 1.0 ) / 2.0,\n\
	((projectedCoords.y / projectedCoords.w) + 1.0 ) / 2.0 );\n\
\n\
//The back position is the world space position stored in the texture.\n\
vec3 backPos = texture2D(backTex, texc).xyz;\n\
\n\
//The front position is the world space position of the second render pass.\n\
vec3 frontPos =  worldSpaceCoords;//texture2D(frontPosTex, texc).xyz; //\n\
\n\
//The direction from the front position to back position.\n\
vec3 dir = backPos - frontPos;\n\
\n\
float rayLength = length(dir);\n\
\n\
//Calculate how long to increment in each step.\n\
float delta = 1.0 / steps;\n\
\n\
//The increment in each direction for each step.\n\
vec3 deltaDirection = normalize(dir) * delta;\n\
float deltaDirectionLength = length(deltaDirection);\n\
\n\
//Start the ray casting from the front position.\n\
vec3 currentPosition = frontPos;\n\
\n\
//The color accumulator.\n\
vec4 accumulatedColor = vec4(0.0);\n\
\n\
//The alpha value accumulated so far.\n\
float accumulatedAlpha = 0.0;\n\
\n\
//How long has the ray travelled so far.\n\
float accumulatedLength = 0.0;\n\
\n\
//If we have twice as many samples, we only need ~1/2 the alpha per sample.\n\
//Scaling by 256/10 just happens to give a good value for the alphaCorrection slider.\n\
float alphaScaleFactor = 25.6 * delta;\n\
    \n\
vec4 colorSample;\n\
float alphaSample;\n\
\n\
//Perform the ray marching iterations\n\
    for(int i = 0; i < MAX_STEPS; i++)\n\
{\n\
    //Get the voxel intensity value from the 3D texture.\n\
    colorSample = sampleAs3DTexture( currentPosition );\n\
		 \n\
    //Allow the alpha correction customization.\n\
    alphaSample = colorSample.a * alphaCorrection;\n\
\n\
    //Applying this effect to both the color and alpha accumulation results in more realistic transparency.\n\
    alphaSample *= (1.0 - accumulatedAlpha);\n\
    \n\
    //Scaling alpha by the number of steps makes the final color invariant to the step size.\n\
    alphaSample *= alphaScaleFactor;\n\
\n\
    //Perform the composition.\n\
    accumulatedColor += colorSample * alphaSample;\n\
\n\
    //Store the alpha accumulated so far.\n\
    accumulatedAlpha += alphaSample;\n\
\n\
    //Advance the ray.\n\
    currentPosition += deltaDirection;\n\
    accumulatedLength += deltaDirectionLength;\n\
\n\
    //If the length traversed is more than the ray length, or if the alpha accumulated reaches 1.0 then exit.\n\
    if(accumulatedLength >= rayLength || accumulatedAlpha >= 1.0 )\n\
    break;\n\
}\n\
    if(accumulatedColor.a==0.0)discard;\n\
if(alpha >=0.0 && alpha <= 1.0){\n\
    gl_FragColor  = vec4(accumulatedColor.rgb,accumulatedColor.a*alpha);\n\
}else{\n\
    gl_FragColor  =    accumulatedColor  ;\n\
}\n\
}\n\
#endif\n\
\n\
#ifdef USE_NORMAL\n\
varying vec3 v_position; \n\
void main()\n\
{  \n\
vec4 color=radar_sample3DTexture(v_position);\n\
if(color.a==0.0)discard;\n\
gl_FragColor = color;\n\
}\n\
#endif\n\
'
