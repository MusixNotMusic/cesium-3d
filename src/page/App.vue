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
    </div>
</template>

<script>
import { loadPng } from '@/3d/lib/FileParser/png/loadPngData';
import { loadCRPZ } from '@/3d/lib/FileParser/CRPZ/CRPZLoader';
export default {
  data() {
    return {
      productionNames: ['points', 'face', 'cube', 'loader'],
      activeIndex: -1,
      message: 'Example Vue component'
    }
  },
  methods: {
      switchMode (index) {
          let indexMapName = ['point', 'face', 'cube', 'extrusion']
          this.activeIndex = index;
          if (index < 3) {
            loadPng().then((data) => {
                this.$main3D.productionSwitch(indexMapName[index], data);
            })
          } else if( index === 3) {
            console.log('test loader CRPZ');
            loadCRPZ().then((data) => {
                this.$main3D.productionSwitch(indexMapName[index], data);
            })
          }
      }
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
                li ~ .active {
                    color: #f59a23;
                }
            }
        }
    // }
</style>
