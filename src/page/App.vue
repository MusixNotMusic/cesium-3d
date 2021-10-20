<template>
    <div class="wrap-production">
        <ul>
            <li v-for="(name, index) in productionNames"
                :key="index"
                :class="{'active': index === activeIndex }"
                @click="switchMode(index)" >
                <div class="listStyle"></div>
                <div class="title">{{name}}</div>
            </li>
        </ul>
        <!-- <div class='color-card'>
            <clr-view :width="60" :height="200" :baseURL="baseURL" :fileName="fileName"></clr-view>
        </div> -->
    </div>
</template>

<script>
import { loadPng } from '@/3d/lib/FileParser/png/loadPngData';
import { loadCRPZ } from '@/3d/lib/FileParser/CRPZ/CRPZLoader';
import { loadMax } from '@/3d/lib/FileParser/Max/MaxLoader';
import { loadRTDPZ } from '@/3d/lib/FileParser/RTDPZ/RTDPZLoader';
import ColorProcess from '@/3d/lib/ColorCardParser/color/ColorProcess';
import ClrView from './components/ClrView.vue';
import { measureLine } from '@/3d/lib/tool/measure';
import { MouseMoveWall } from '@/3d/test/plane';

export default {
  components: { ClrView },
  data() {
    return {
      productionNames: ['点', '面', '体', '挤压', 'Max', '格点数据'],
      activeIndex: -1,
      baseURL: 'http://222.18.149.195:9091/configs/Clr/',
    //   fileName: 'clrZ.clr'
      fileName: 'clrMAXRef.clr'
    }
  },
  methods: {
    switchMode (index) {
        let indexMapName = ['point', 'face', 'cube', 'extrusion', 'max', 'grid']
        this.activeIndex = index;

        if (window.wall) {
            window.wall.destroy();
        }

        if (index < 3) {
            const colorPrcess = new ColorProcess()
            colorPrcess.initPromise(this.fileName, this.baseURL).then((data) => {
                MeteoInstance.colorCard = data.colorArray.map(hexString => {
                    return window.parseInt(`0x${hexString.slice(1)}`);
                });
                MeteoInstance.colorArray = data.colorArray;
                loadPng().then((data) => {
                    // measureLine(MeteoInstance.cesium.viewer);
                    console.log('data ==>', data);
                    window.wall = new MouseMoveWall(data);
                    
                    MeteoInstance.maxWGS84 = [data.Header.Position[0], data.Header.Position[1]];
                    MeteoInstance.minWGS84 = [data.Header.Position[0], data.Header.Position[1]];
                    this.$main3D.productionSwitch(indexMapName[index], data);
                    MeteoInstance.objectStoreIns.updateWGS84();
                })
             })
        } else if( index === 3) {
            const colorPrcess = new ColorProcess()
            colorPrcess.initPromise(this.fileName, this.baseURL).then((data) => {
                MeteoInstance.colorCard = data.colorArray.map(hexString => {
                    return window.parseInt(`0x${hexString.slice(1)}`);
                });
                MeteoInstance.colorArray = data.colorArray;
                loadCRPZ().then((data) => {
                  this.$main3D.productionSwitch(indexMapName[index], data);
                })
            })

        } else if( index === 4) {
            const colorPrcess = new ColorProcess();
            colorPrcess.initPromise(this.fileName, this.baseURL).then((data) => {
                MeteoInstance.colorCard = data.colorArray.map(hexString => {
                    return window.parseInt(`0x${hexString.slice(1)}`);
                });
                MeteoInstance.colorArray = data.colorArray;
                loadMax().then((data) => {
                  this.$main3D.productionSwitch(indexMapName[index], data);
                });
            })
        } else if( index === 5) {
            const colorPrcess = new ColorProcess();
            colorPrcess.initPromise(this.fileName, this.baseURL).then((data) => {
                MeteoInstance.colorCard = data.colorArray.map(hexString => {
                    return window.parseInt(`0x${hexString.slice(1)}`);
                });
                MeteoInstance.colorArray = data.colorArray;
                loadRTDPZ().then((data) => {
                  console.log('loadRTDPZ ==>', data);
                  this.$main3D.productionSwitch(indexMapName[index], data);
                });
            })
        }
    },
  },
  mounted () {
    window.$vue = this;

    this.$socket.loginInfIdentify(this.$socketConst.LOGIN_IN, 'user001', '888888');

    this.switchMode(5)
  }
}
</script>

<style lang="scss" scoped>
    // .wrap-page {
    //     position: absolute;
    //     top: 0;
    //     left: 0;
    //     height: 100%;
    //     width: 100%;
    //     margin: 0;
    //     overflow: hidden;
    //     padding: 0;
    //     font-family: sans-serif;
    //     /* z-index: 1; */
    //     pointer-events: none;

        .wrap-production {
            position: fixed;
            top: 100px;
            left: 10px;
            display: flex;

            // .mark-bar {
            //     width: 30px;
            //    .mark-bar-item {

            //    }
            // }

            ul {
                list-style: none;
                li {
                    display: flex;
                    justify-content: left;
                    align-items: center;
                    cursor: pointer;
                    .listStyle {
                        width: 10px;
                        height: 10px;
                        background: #ccc;
                        margin-right: 10px;
                    }
                    .listStyle::before {

                    }
                    .title {
                        color: white;
                    }
                }

                li:hover {
                    display: flex;
                    justify-content: left;
                    align-items: center;
                    cursor: pointer;
                    .listStyle {
                        background: #f59a23;
                    }
                    .title {
                        color: #f59a23;
                    }
                }
               .active {
                    color: #f59a23 !important;
                }
            }
        }

        .color-card {
            position: fixed;
            left: 20px;
            bottom: 100px;
            width: 80px;
            height: 300px;
        }
    // }
</style>
