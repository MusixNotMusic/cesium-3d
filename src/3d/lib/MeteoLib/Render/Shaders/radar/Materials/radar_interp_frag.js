export const radar_interp_frag =
  '//用于剖切插值的片元着色器代码\n\
                   #include <radar_sample3DTexture>\n\
                \n\
    varying vec3 v_position; \n\
    uniform vec3 dimensions;\n\
    uniform float sliceCoord;//剖切参数，分层则为高度，南北剖切则为y坐标，东西剖切则为x坐标，旋转剖切则为旋转角度\n\
    uniform float mode;//0表示分成剖切，1表示南北剖切，2表示东西剖切,3表示旋转剖切,4表示单层投影,5表示RHI距离高度显示,6表示VCS任意垂直剖面、7表示组合反射率\n\
    uniform float encode;\n\
    uniform bool useLinearInterp;\n\
    uniform bool exportValue;\n\
    uniform vec3 startPoint;\n\
    uniform vec3 endPoint;\n\
    uniform vec3 viewDimensions;\n\
    \n\
    vec2 rotate(vec2 rxy, vec2 xy,float a){\n\
        a=radians(a);\n\
        float x0= (xy.x - rxy.x)*cos(a) - (xy.y - rxy.y)*sin(a) + rxy.x ;    \n\
        float y0= (xy.x - rxy.x)*sin(a) + (xy.y - rxy.y)*cos(a) + rxy.y ;\n\
        return vec2(x0,y0);\n\
    \n\
    }\n\
    void main()\n\
    {   \n\
        vec4 color; \n\
        float val=-999.0; \n\
        vec2 pos=(v_position.xy/2.0)*dimensions.xy;\n\
        //笛卡尔坐标转极坐标 \n\
        vec3 polarCoords=radar_cartesian2Polar(vec3(pos.x,-pos.y,sliceCoord)); \n\
        if(mode==1.0){\n\
            pos=(v_position.xy/2.0)*dimensions.xz; \n\
            polarCoords=radar_cartesian2Polar(vec3(pos.x,sliceCoord,-pos.y +dimensions.z/2.0));\n\
        }\n\
        else if(mode==2.0){\n\
            pos=(v_position.xy/2.0)*dimensions.yz; \n\
            polarCoords=radar_cartesian2Polar(vec3(sliceCoord,pos.x,-pos.y +dimensions.z/2.0));\n\
        }\n\
       else if(mode==3.0){\n\
            pos=(v_position.xy/2.0)*dimensions.xz; \n\
            vec3 pos3=vec3(pos.x,0.0,-pos.y+dimensions.z/2.0);\n\
            float angle=radians(sliceCoord);\n\
            pos3.x = pos.x*cos(angle);\n\
            pos3.y = pos.x*sin(angle);\n\
            polarCoords=radar_cartesian2Polar(pos3);\n\
        }\n\
       else if(mode==4.0){\n\
            float theta =  atan(pos.x, -pos.y);\n\
            theta = degrees(theta);\n\
            if (theta < 0.0) {\n\
                theta = 360.0 + theta;\n\
            }\n\
            float a = radians(sliceCoord);\n\
            float r = sqrt(pow(pos.x,2.0)+ pow(pos.y ,2.0)) /cos(a);\n\
            polarCoords.x=r / gateSizeOfReflectivity;\n\
            polarCoords.y=theta;\n\
            polarCoords.z=sliceCoord;\n\
        }\n\
        else if(mode==5.0){\n\
            pos=((v_position.xy+1.0)/2.0);\n\
            vec3 pos3;\n\
            float angle=radians(sliceCoord);\n\
            float len= viewDimensions.x/2.0 ;\n\
            pos3.x = pos.x*len*sin(angle);\n\
            pos3.y =  pos.x*len*cos(angle);\n\
            pos3.z = (1.0-pos.y)*viewDimensions.z;\n\
            polarCoords=radar_cartesian2Polar(pos3);\n\
        }\n\
        else if(mode==6.0){\n\
            pos=((v_position.xy+1.0)/2.0); \n\
            vec3 pos3;\n\
            vec3 dir=endPoint-startPoint;\n\
            float len=length(dir.xy)*pos.x;\n\
\n\
            float angle=atan(dir.x,dir.y);\n\
            pos3.x= (len*sin(angle)+startPoint.x);\n\
            pos3.y= (len*cos(angle)+startPoint.y);\n\
\n\
            pos3.z=(1.0-pos.y)*viewDimensions.z;\n\
            polarCoords=radar_cartesian2Polar(pos3);\n\
        }\n\
    \n\
         if(mode==7.0){//组合反射率\n\
            float theta =  atan(pos.x, -pos.y);\n\
            theta = degrees(theta);\n\
            if (theta < 0.0) {\n\
                theta = 360.0 + theta;\n\
            }\n\
            float f_i=0.0,tempV;\n\
            for (int i = 0; i < max_layerCount; i++){\n\
                if (f_i >= layerCount) break;\n\
                float a = radians(radar_getElevation(f_i)); \n\
                float r = sqrt(pow(pos.x, 2.0) + pow(pos.y, 2.0)) / cos(a); \n\
                polarCoords.x = r / gateSizeOfReflectivity; \n\
                polarCoords.y = theta; \n\
                color=radar_sampleData(polarCoords.x,polarCoords.y,i);\n\
                if(color.a!=0.0){\n\
                    tempV=radar_decode(color);\n\
                    val= val<tempV?tempV:val;\n\
                }\n\
                f_i++;\n\
            }\n\
        }else{\n\
            if((polarCoords.x==-1.0&&polarCoords.x==-1.0&&polarCoords.x==-1.0)\n\
                || polarCoords.x>rGates)\n\
                val=-999.0; \n\
            else { \n\
                //8点插值\n\
                if(useLinearInterp)val=radar_epiInterp(polarCoords); \n\
                else val=radar_nearInterp(polarCoords); \n\
            }\n\
        }\n\
    \n\
    if(exportValue){\n\
        color=vec4(val,val,val,1.0);\n\
    }else{\n\
            if(val!=-999.0){\n\
                if(encode!=0.0){//编码\n\
                    color.r=(val*scale+offset)/255.0;\n\
                    color.g=color.r;\n\
                    color.b=color.r;\n\
                    color.a=1.0;\n\
                }else{\n\
                    //从图例中查找颜色\n\
                    vec2 val_st=vec2((val-min)/(max-min),0.5); \n\
                    color=texture2D(texTransform,val_st); \n\
                    \n\
                }\n\
            }else color=vec4(0.);\n\
        \n\
        if(color.a==0.0)discard;\n\
    }\n\
        gl_FragColor = color;\n\
    }'
