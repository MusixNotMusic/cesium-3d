import Vue from 'vue';
import App from '@/page/App.vue';
import EventEmitter2  from 'eventemitter2';
import { throttle } from 'lodash';

import { Main3D } from '@/3d/main/index';
import { loadPng } from '@/3d/lib/FileParser/png/loadPngData';
import SocketProxy from '@/3d/lib/socket/socketProxy';
import socketConst from '@/3d/lib/socket/socketConst';
import NameSpace from '@/3d/lib/Common/nameSpace';
import buffer from '@/3d/lib/Common/buffer';
import $axios from '@/config/axios-config.js';
import { registerEmitter } from '@/3d/lib/emitter';

import { socketIP, socketPort } from './env.config'

import { generatorPlane } from '@/3d/test/cesiumPlane';
import { movePlane } from '@/3d/test/movePlane';
window.generatorPlane = generatorPlane;
window.movePlane = movePlane;

const main3D = new Main3D();
const socket = new SocketProxy(socketIP, socketPort, (type, data) => {
    onWebSocketResult(data);
});
// 订阅发布
MeteoInstance.emitter = new EventEmitter2();
MeteoInstance.socket = socket;
const _sendOnTimeProductToPT = throttle(MeteoInstance.socket.sendOnTimeProductToPT.bind(MeteoInstance.socket), 200);
MeteoInstance.socket._sendOnTimeProductToPT = _sendOnTimeProductToPT;
MeteoInstance.socketConst = socketConst;
registerEmitter();

loadPng().then((data) => {
    main3D.main(data)
})

Vue.prototype.$axios = $axios;
Vue.prototype.$main3D = main3D;
Vue.prototype.$socket = socket;
Vue.prototype.$socketConst = socketConst;
new Vue({
    render: h => h(App)
  }).$mount('#pageApp')


/**
 * 接收到websocket发送过来的消息
 * @param resp
 */
function onWebSocketResult (noti) {
    if (noti) {
        let arraybuffer = noti.notiBody
        if (noti.notiType === socketConst.NET_DATA_TYPE_PTTOUT_GEN_RESULT) {
            let temp = buffer.getValueFromTypedArray(buffer.getArrFromBuffer(arraybuffer, 8, 'Int32', 1), 'Int32')
            if (temp === socketConst.TYPE_PRODUCT_GEN_RESULT) {
                let result = buffer.getValueFromTypedArray(buffer.getArrFromBuffer(arraybuffer, 12, 'Int32', 1), 'Int32')
                if (result === socketConst.PRO_GEN_SUCESS) {
                // 产品生成成功
                    let posFile = buffer.getValueFromTypedArray(buffer.getArrFromBuffer(arraybuffer, socketConst.DATA_HeadLength, 'Int8', 256), 'Int8') //
                    // console.log('posFile ==>', noti, posFile)
                    MeteoInstance.emitter.emit(NameSpace.REALDATAADDRESS, posFile);
                } else if (result === socketConst.PRO_GEN_FAILED) {
                // 产品生成失败  下面代码待修改
                // data.position = SocketConst.DATA_HeadLength;
                // var errorReason : String  = data.readMultiByte(256, "cn-gb");
                    let errorReason = buffer.getValueFromTypedArray(buffer.getArrFromBuffer(arraybuffer, socketConst.DATA_HeadLength, 'Int8', 256), 'Int8')
                    console.log('errorReason ==>', errorReason);
                    // MeteoInstance.emitter.emit(NameSpace.INSERT + NameSpace.SYSTEMLOG,
                    //     new SysLogVo(SysLogConst.LOG_TYPE_PRODUCT, i18n.t('apply.Falut') + '：【' + errorReason + '】.', true, true, true))
                }
            }
        }
        arraybuffer = null
    }
}
