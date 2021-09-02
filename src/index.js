import Vue from 'vue'
import App from '@/page/App.vue'

import { Main3D } from '@/3d/main/index'
import { loadPng } from '@/3d/lib/FileParser/png/loadPngData';
import $axios from '@/config/axios-config.js'
const main3D = new Main3D()
window.main3D = main3D;
loadPng().then((data) => {
    main3D.main(data)
})

Vue.prototype.$axios = $axios;
Vue.prototype.$main3D = main3D;
new Vue({
    render: h => h(App)
  }).$mount('#pageApp')