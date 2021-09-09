import Vue from 'vue';
import App from '@/page/App.vue';

import { Main3D } from '@/3d/main/index';
import { loadPng } from '@/3d/lib/FileParser/png/loadPngData';
import SocketProxy from '@/3d/lib/socket/socketProxy';
import socketConst from '@/3d/lib/socket/socketConst';
import $axios from '@/config/axios-config.js';
import { socketIP, socketPort } from './env.config'

const main3D = new Main3D();
const socket = new SocketProxy(socketIP, socketPort);
// login
socket.loginInfIdentify(socketConst.LOGIN_IN, 'user093', '888888');

function getConfigVo() {
    let obj = {};
    let params = [175000, 0, 175000, 180];
    obj.params = params;
    obj.fileParams = params;
    obj.sTime = 1629987484000;
    obj.eTime = 1629987484000;
    return obj;
}

const o = getConfigVo()
// send
socket.sendOnTimeProductToPT(o, 123);

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