<template>
  <div class="container">
    <div class="groupDiv" ref="groupDiv" v-on:mousedown = "onMouseDown">
      <canvas class="clrCanvas" ref="clrCanvas" ></canvas>
      <canvas class="optionFMCanvas" ref="optionFMCanvas" ></canvas>
      <!--不可见的时候绘图会异常, -->
      <canvas class="optionLightCanvas" ref="optionLightCanvas" v-show="lightVisible"></canvas>
    </div>
   <!-- 目前只对色标竖向绘制、同为色块提供此功能-->
    <!-- <vue-context-menu class="right-menu" :target="menuTarget" :show="menuVisible && !isH" v-if="enableOption"
                      @update:show="(show) => menuVisible = show">
      <el-menu  v-for="(item,index) in menuList"  class="el-menu-demo" mode="vertical" collapse :key="index" :index="index"
                popper-class="right-menu-popper">
        <hr v-if="index!=='comOpt' && item.visible"/>
        <el-menu-item  v-for="(list,listIndex) in item.arr" @click="list.clickFun(list)" :disabled="list.disable"
                       :key="listIndex" :index="index+listIndex.toString()">
          {{list.label}}
        </el-menu-item>
      </el-menu>
    </vue-context-menu> -->
  </div>

</template>

<script>
// import VueContextMenu from '@/3d/VueContextMenu'
import ClrOption from '@/3d/lib/ColorCardParser/color/ClrOptionDef'
import ColorProcess from '@/3d/lib/ColorCardParser/color/ColorProcess'
// import productConfig from '@/3d/lib/ColorCardParser/common/productConfig'
export default {
  name: 'ClrView',
  // components: {
  //   VueContextMenu
  // },

  props: {
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    clrWid: {
      type: Number,
      default: 0
    },
    // 色标文件的路径，不包括文件名
    baseURL: {
      type: String,
      default: ''
    },

    enableOption: {
      type: Boolean,
      default: true
    }

  },
  watch: {
    width (val) {
      this.width = val
      this.drawClrCanvas()
    },
    height (val) {
      this.height = val
      this.drawClrCanvas()
    },
    clrWid (val) {
      this.clrWid = val
      this.drawClrCanvas()
    },
    proType () {
      this.fileName = 'clrZ.clr' || productConfig.getClrFileNameByType(this.proType)
    },
    fileName () {
      this.handleFileChange()
    },
    colorProcess: {
      handler: function (val, oldVal) {
        this.colorProcess = val
        // 设置色标右键菜单是否启用
        // if (this.colorProcess._EchoShowType === 1 && this.colorProcess._BlockShowType === 1) {
        //   this.menuOn = true
        // } else
        if (this.colorProcess) {
          if ((this.colorProcess._EchoShowType === 0 || this.colorProcess._EchoShowType === 2) &&
                      (this.colorProcess._BlockShowType === 0 || this.colorProcess._BlockShowType === 2)) {
            let temp
            for (const key in this.menuList) {
              if (key === 'filterClr' || key === 'comOpt') {
                if (this.menuList[key] && this.menuList[key].arr) {
                  temp = this.menuList[key].arr
                  for (let i = 0; i < temp.length; i++) {
                    temp[i].disable = false
                  }
                }
              }
            }
          } else {
            let temp
            for (const key in this.menuList) {
              if (key === 'filterClr' || key === 'comOpt') {
                if (this.menuList[key] && this.menuList[key].arr) {
                  temp = this.menuList[key].arr
                  for (let i = 0; i < temp.length; i++) {
                    temp[i].disable = true
                  }
                }
              }
            }
          }
        }

        this.drawClrCanvas()
        // 色标文件名未改时，不清空闪烁相关
        if (!this.colorProcess) {
          if (this.isLight) {
            if (this.menuList && this.menuList.comOpt && this.menuList.comOpt.arr) {
              this.menuList.comOpt.trigleClick(ClrOption.CLR_LIGNHT + ClrOption.CLOSE)
            }
          }
          // 色标文件名未改时，不清空过滤合并相关
          this.fMIndexArr = null
          this.clearCanvas(this.$refs.optionFMCanvas)
        }
      },
      deep: true
    },
    resetClrDisable (val) {
      this.resetClrDisable = val
      if (this.menuList && this.menuList.changeClr && this.menuList.changeClr.arr) {
        this.menuList.changeClr.updateDisable(ClrOption.CLR_RESET, this.resetClrDisable)
      }
    },
    isLight (val) {
      this.isLight = val
      if (this.menuList && this.menuList.comOpt && this.menuList.comOpt.arr) {
        this.menuList.comOpt.updateDisable(ClrOption.CLR_LIGNHT + ClrOption.CLOSE, !this.isLight)
      }
    }

  },
  data () {
    return {
      fileName: '',
      evt: null,
      evtInfo: null,
      isH: false, /* @param isH true表示水平方向绘制 */
      isSToB: -1, /* * @param isSToB：1表示从小到大，0：表示从大到小；-1：表示根据色标文件中的_viewType而定，既isSToB = ！_viewType */
      pObj: { pLeft: 5, pRight: 5, pTop: 5, pBottom: 5 },
      resetClrDisable: true, // 恢复预定颜色使能
      isLight: false, // 取消闪烁使能
      lightColorArr: null,
      lightVisible: false,
      lightIndexArr: null,
      fMIndexArr: null,
      colorProcess: null,
      // 鼠标右键菜单相关
      menuTarget: null,
      menuVisible: false,
      timeOut: 0, // 定时器，以防频繁重绘
      menuList: {
        comOpt: {
          visible: true,
          arr: [
            {
              imgShow: true,
              label: '闪烁', // i18n.t('pView.zoomIn'),
              eventName: ClrOption.CLR_LIGNHT,
              disable: false,
              isSelected: false, //
              clickFun: (item) => {
                this.isLight = true
                this.menuVisible = false
                item.isSelected = !item.isSelected
                if (this.evtInfo) {
                  // 不可见的时候绘图会异常
                  this.lightVisible = true
                  if (!this.lightIndexArr) this.lightIndexArr = []
                  this.lightIndexArr.push(this.evtInfo.index)
                  this.drawLightOption()
                  if (!this.lightColorArr) this.lightColorArr = this.colorProcess.colorArray.slice() // 深拷贝
                  const minIndex = this.evtInfo.min
                  const maxIndex = this.evtInfo.max
                  for (let i = minIndex; i < maxIndex; i++) {
                    this.lightColorArr.splice(i, 1, '#000000') // 用splice(i, 1, temp.rgbStr_16)更改才能出发watch监听器的colorProcess
                  }
                  this.$emit('colorLightChange', this.isLight)
                }
              }
            },
            {
              imgShow: true,
              label: '取消闪烁', // i18n.t('pView.zoomIn'),
              eventName: ClrOption.CLR_LIGNHT + ClrOption.CLOSE,
              disable: true,
              isSelected: false, //
              clickFun: (item) => {
                this.isLight = false
                this.lightColorArr = null
                this.lightIndexArr = null
                this.menuVisible = false
                item.isSelected = !item.isSelected
                this.clearCanvas(this.$refs.optionLightCanvas)
                this.$emit('colorLightChange', this.isLight)
              }
            }
          ],
          updateDisable (eventName, disable) {
            if (this.arr) {
              for (let i = 0; i < this.arr.length; i++) {
                if (this.arr[i]) {
                  if (eventName === this.arr[i].eventName) {
                    this.arr[i].disable = disable
                  }
                }
              }
            }
          },
          trigleClick (eventName) {
            if (this.arr) {
              for (let i = 0; i < this.arr.length; i++) {
                if (this.arr[i]) {
                  if (eventName === this.arr[i].eventName) {
                    this.arr[i].clickFun(this.arr[i])
                  }
                }
              }
            }
          }
        },
        changeClr: {
          visible: true,
          arr: [
            {
              imgShow: true,
              label: '恢复预定颜色', // i18n.t('pView.zoomIn'),
              eventName: ClrOption.CLR_RESET,
              disable: true,
              isSelected: false,
              clickFun: (item) => {
                this.resetClrDisable = true
                this.menuVisible = false
                item.isSelected = !item.isSelected
                if (this.isLight) {
                  if (this.menuList && this.menuList.comOpt && this.menuList.comOpt.arr) {
                    this.menuList.comOpt.trigleClick(ClrOption.CLR_LIGNHT + ClrOption.CLOSE)
                  }
                }
                this.fMIndexArr = null
                this.clearCanvas(this.$refs.optionFMCanvas)
                this.colorProcess.resetClr()
                this.$emit('colorProcessChange', this.colorProcess)
              }
            },
            {
              imgShow: true,
              label: '灰度', // '灰度/彩色（G）',
              eventName: ClrOption.CLR_GRAY,
              disable: false,
              isSelected: false,
              clickFun: (item) => {
                this.resetClrDisable = false
                this.menuVisible = false
                item.isSelected = !item.isSelected
                if (this.isLight) {
                  if (this.menuList && this.menuList.comOpt && this.menuList.comOpt.arr) {
                    this.menuList.comOpt.trigleClick(ClrOption.CLR_LIGNHT + ClrOption.CLOSE)
                  }
                }
                this.fMIndexArr = null
                this.clearCanvas(this.$refs.optionFMCanvas)
                this.colorProcess.grayClr()
                this.$emit('colorProcessChange', this.colorProcess)
              }
            }
          ],
          updateDisable (eventName, disable) {
            if (this.arr) {
              for (let i = 0; i < this.arr.length; i++) {
                if (this.arr[i]) {
                  if (eventName === this.arr[i].eventName) {
                    this.arr[i].disable = disable
                  }
                }
              }
            }
          }
        },
        filterClr: {
          visible: true,
          arr: [
            {
              imgShow: true,
              label: '单色过滤', // i18n.t('pView.zoomIn'),
              eventName: ClrOption.CLR_FILTER_ONE,
              disable: false,
              isSelected: false,
              clickFun: (item) => {
                this.resetClrDisable = false
                this.menuVisible = false
                item.isSelected = !item.isSelected
                if (this.isLight) {
                  if (this.menuList && this.menuList.comOpt && this.menuList.comOpt.arr) {
                    this.menuList.comOpt.trigleClick(ClrOption.CLR_LIGNHT + ClrOption.CLOSE)
                  }
                }
                this.colorProcess.filterClr(this.isSToB, 0, '#000000', this.evtInfo)

                if (!this.fMIndexArr) this.fMIndexArr = []
                this.fMIndexArr.push(this.evtInfo.index)
                this.drawFilterMergeOption()

                this.$emit('colorProcessChange', this.colorProcess)
              }
            },
            {
              imgShow: true,
              label: '向上过滤',
              eventName: ClrOption.CLR_FILTER_UP,
              disable: false,
              isSelected: false,
              clickFun: (item) => {
                this.resetClrDisable = false
                this.menuVisible = false
                item.isSelected = !item.isSelected
                if (this.isLight) {
                  if (this.menuList && this.menuList.comOpt && this.menuList.comOpt.arr) {
                    this.menuList.comOpt.trigleClick(ClrOption.CLR_LIGNHT + ClrOption.CLOSE)
                  }
                }
                const obj = this.colorProcess.filterClr(this.isSToB, 1, '#000000', this.evtInfo)
                if (!this.fMIndexArr) this.fMIndexArr = []
                this.fMIndexArr = this.fMIndexArr.concat(this.getRectIndexArr(obj))
                this.drawFilterMergeOption()
                this.$emit('colorProcessChange', this.colorProcess)
              }
            },
            {
              imgShow: true,
              label: '向下过滤', // i18n.t('pView.zoomIn'),
              eventName: ClrOption.CLR_FILTER_ONE,
              disable: false,
              isSelected: false,
              clickFun: (item) => {
                this.resetClrDisable = false
                this.menuVisible = false
                item.isSelected = !item.isSelected
                if (this.isLight) {
                  if (this.menuList && this.menuList.comOpt && this.menuList.comOpt.arr) {
                    this.menuList.comOpt.trigleClick(ClrOption.CLR_LIGNHT + ClrOption.CLOSE)
                  }
                }
                const obj = this.colorProcess.filterClr(this.isSToB, -1, '#000000', this.evtInfo)
                if (!this.fMIndexArr) this.fMIndexArr = []
                this.fMIndexArr = this.fMIndexArr.concat(this.getRectIndexArr(obj))
                this.drawFilterMergeOption()
                this.$emit('colorProcessChange', this.colorProcess)
              }
            },
            {
              imgShow: true,
              label: '向上合并',
              eventName: ClrOption.CLR_MERGE_UP,
              disable: false,
              isSelected: false,
              clickFun: (item) => {
                this.resetClrDisable = false
                this.menuVisible = false
                item.isSelected = !item.isSelected
                if (this.isLight) {
                  if (this.menuList && this.menuList.comOpt && this.menuList.comOpt.arr) {
                    this.menuList.comOpt.trigleClick(ClrOption.CLR_LIGNHT + ClrOption.CLOSE)
                  }
                }
                const obj = this.colorProcess.mergeClr(this.isSToB, true, this.evtInfo)
                if (!this.fMIndexArr) this.fMIndexArr = []
                this.fMIndexArr = this.fMIndexArr.concat(this.getRectIndexArr(obj))

                this.drawFilterMergeOption()
                this.$emit('colorProcessChange', this.colorProcess)
              }
            },
            {
              imgShow: true,
              label: '向下合并',
              eventName: ClrOption.CLR_MERGE_DOWN,
              disable: false,
              isSelected: false,
              clickFun: (item) => {
                this.resetClrDisable = false
                this.menuVisible = false
                item.isSelected = !item.isSelected
                if (this.isLight) {
                  if (this.menuList && this.menuList.comOpt && this.menuList.comOpt.arr) {
                    this.menuList.comOpt.trigleClick(ClrOption.CLR_LIGNHT + ClrOption.CLOSE)
                  }
                }
                const obj = this.colorProcess.mergeClr(this.isSToB, false, this.evtInfo)
                if (!this.fMIndexArr) this.fMIndexArr = []
                this.fMIndexArr = this.fMIndexArr.concat(this.getRectIndexArr(obj))
                this.drawFilterMergeOption()
                this.$emit('colorProcessChange', this.colorProcess)
              }
            }
          ]
        }
      }

    }
  },
  // computed: {
  //   proType () {
  //     return this.$store.state.userOption.proType
  //   }
  // },
  mounted () {
    console.log('ClrView ===> mounted')
    this.menuTarget = this.$refs.groupDiv
    this.handleFileChange()
    console.log('mounted drawClrCanvas')
  },
  beforeDestroy () {
  },
  methods: {
    onMouseDown (evt) {
      this.evt = evt
      if (this.colorProcess) {
        this.evtInfo = this.colorProcess.getInfo(this.$refs.clrCanvas, this.isH, this.isSToB, this.clrWid, this.pObj
          , { x: this.evt.offsetX, y: this.evt.offsetY })
      }
    },
    handleFileChange () {
      if (this.fileName && this.baseURL) {
        if (this.colorProcess && this.colorProcess.clrFName === this.fileName) {
          // 相同 不做任何处理
        } else {
          this.colorProcess = null
          this.colorProcess = new ColorProcess()
          this.colorProcess.init(this.fileName, this.baseURL, () => {
            this.$emit('colorProcessChange', this.colorProcess)
            this.drawClrCanvas()
          })
        }
      } else {
        this.colorProcess = null
      }
    },

    drawClrCanvas () {
      if (this.timeout)clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        if (!this.$refs.clrCanvas) return
        this.$refs.clrCanvas.width = this.width
        this.$refs.clrCanvas.height = this.height
        console.log('drawClrCanvas ==>', this.colorProcess)
        if (this.colorProcess) {
          this.colorProcess.drawColorCavans(this.$refs.clrCanvas, this.isH, this.isSToB, '#ff0000', '#00ff00', this.clrWid, this.pObj)
          this.drawLightOption()
          this.drawFilterMergeOption()
        } else {
          // 1、清空画布
          const ctx = this.$refs.clrCanvas.getContext('2d')
          ctx.clearRect(0, 0, this.$refs.clrCanvas.width, this.$refs.clrCanvas.height)
          this.clearCanvas(this.$refs.optionLightCanvas)
        }
      }, 60)
    },
    drawOptionCanvas (canvas, isClear, type, colorStyle, rect) {
      if (isClear) {
        this.clearCanvas(canvas)
      }
      const ctxO = canvas.getContext('2d')
      if (type !== 'fill' && type !== 'stroke')type = 'stroke'
      ctxO[type + 'Style'] = colorStyle
      ctxO[type + 'Rect'](rect.x, rect.y, rect.width, rect.height)
    },
    clearCanvas (canvas) {
      if (!canvas) return
      const ctxO = canvas.getContext('2d')
      ctxO.clearRect(0, 0, canvas.width, canvas.height)
    },
    /** 绘制闪烁相关 */
    drawLightOption () {
      if (this.lightIndexArr) {
        this.$refs.optionLightCanvas.width = this.width
        this.$refs.optionLightCanvas.height = this.height
        this.lightIndexArr = this.lightIndexArr.distinct() // 去重
        let index
        let rect
        for (let i = 0; i < this.lightIndexArr.length; i++) {
          index = this.lightIndexArr[i]
          rect = this.colorProcess.phraseClrFileArr[index].rect
          if (rect) {
            this.drawOptionCanvas(this.$refs.optionLightCanvas, false, 'fill', '#000000', rect)
            this.drawOptionCanvas(this.$refs.optionLightCanvas, false, 'stroke', '#FF0000', rect)
          }
        }
      }
    },
    /** 绘制过滤合并相关 */
    drawFilterMergeOption () {
      if (this.fMIndexArr) {
        this.$refs.optionFMCanvas.width = this.width
        this.$refs.optionFMCanvas.height = this.height
        let index
        let rect
        this.fMIndexArr = this.fMIndexArr.distinct() // 去重
        for (let i = 0; i < this.fMIndexArr.length; i++) {
          index = this.fMIndexArr[i]
          rect = this.colorProcess.phraseClrFileArr[index].rect
          if (rect) {
            this.drawOptionCanvas(this.$refs.optionFMCanvas, false, 'stroke', '#FF0000', rect)
          }
        }
      }
    },
    /** @param obj.minIndex，obj.maxIndex 表示色域 */
    getRectIndexArr (obj) {
      let indexArr = null
      if (obj && this.colorProcess.phraseClrFileArr) {
        let temp
        indexArr = []
        for (let i = 0; i < this.colorProcess.phraseClrFileArr.length; i++) {
          temp = this.colorProcess.phraseClrFileArr[i]
          if (temp) {
            if (temp.min >= obj.minIndex && temp.min <= obj.maxIndex && temp.max >= obj.minIndex && temp.max <= obj.maxIndex) {
              indexArr.push(i)
            }
          }
        }
      }
      return indexArr
    },
    /* 关闭窗口 */
    closeWindow () {
      this.$emit('closeWindow')
    }

  }

}
</script>

<style lang="scss" scoped>
  .container{
    width: 100%;
    height: 100%;
  }
  .groupDiv {
    position: relative;
    z-index: 0;
    width: 100%;
    height: 100%;
    >canvas{
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
    .clrCanvas{
      z-index: 1;
    }
    .optionFMCanvas{
      z-index: 3;
    }
    .optionLightCanvas{
      z-index: 2;
    }
  }
  .right-menu {
    .disable{
      pointer-events: none;
      cursor: default;
      opacity: 0.6;
    }

    width: 120px !important;
    box-shadow: 0 0.5em 1em 0 rgba(0, 0, 0, .1);
    font-family: Microsoft Yahei, Avenir, Helvetica, Arial, sans-serif;
    font-size: 13px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    color: #2c3e50;
    position: fixed;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, .2);
    border-radius: 3px;
    z-index: 999;
    display: none;

    a {
      padding: 2px 2px;
      height: 22px;
      line-height: 22px;
      text-align: left;
      display: block;
      color: black;

      >span{
        display: inline-block;
        min-width: 18px;
        >img{
          width: 18px;
          height: 20px;
        }
      }

    }
    a:-webkit-any-link {
      color: -webkit-link;
      cursor: pointer;
      text-decoration: underline;
    }

    a:hover {
      background: rgb(194, 224, 254);
    }
    hr{
      margin: 4px 0px;
      width: calc(100% - 0px);
    }
    /deep/.el-menu--collapse {
      width: 100%;
    }
    /deep/.el-menu-item, /deep/.el-submenu__title
    {
      height: 22px;
      line-height: 22px;
      padding: 0px 10px !important;
      .el-submenu__icon-arrow{
        display: inline-block;
        right: 2px;
        color: black;
      }
      i {
        display: inline-block;
        width: 20px;
        height: 20px;
      }
      i:first-child{
        display: inline-block;
        width: 24px;
        height: 24px;
      }
    }
    /deep/.el-menu-item.is-active {
      color: black;
    }
  }

</style>
