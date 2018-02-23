<template>
  <div class="progress-bar" ref="progressBar" @click="clickChangeProgress">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!-- 需要阻止浏览器默认行为,防止拖动浏览器 -->
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import { prefixStyle } from 'common/js/dom'

  const BTN_WIDTH = 16
  const transform = prefixStyle('transform')

  export default {
    props: {
      progressPercent: {
        type: Number,
        default: 0
      }
    },
    created() {
      this.btnTouch = {} // 这个对象用于存储拖动进度条时的信息
    },
    methods: {
      progressTouchStart(e) {
        this.btnTouch.init = true
        this.btnTouch.startX = e.touches[0].pageX
        this.btnTouch.leftW = this.$refs.progress.clientWidth // 黄色进度条的宽度
      },
      progressTouchMove(e) {
        if (!this.btnTouch.init) {
          return
        }
        const deltaX = e.touches[0].pageX - this.btnTouch.startX
        const barW = this.$refs.progressBar.clientWidth - BTN_WIDTH
        // Math.min 控制进度不能超出progressbar
        const newLeftW = Math.min(barW, Math.max(0, deltaX + this.btnTouch.leftW))
        this._setStyle(newLeftW)
      },
      // 触摸事件结束,需要把this.btnTouch.init置为false, 且需要重置 progressPercent, 否则 watch 会干扰
      progressTouchEnd() {
        this.btnTouch.init = false
        this._triggerPercent()
      },
      // 向父组件派发当前拉动进度百分比
      _triggerPercent() {
        const barW = this.$refs.progressBar.clientWidth - BTN_WIDTH
        const newPercent = this.$refs.progress.clientWidth / barW
        this.$emit('percentChange', newPercent)
      },
      // 计算好距离后调整样式的方法,不要漏了px
      _setStyle(newLeftW) {
        this.$refs.progress.style.width = `${newLeftW}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${newLeftW}px, 0, 0)`
      },
      clickChangeProgress(e) {
        // 这里不可直接用e.offsetX（点击进度条区正常，但是点击进度小球后会有问题）
        // this._setStyle(e.offsetX)
        
        const rect = this.$refs.progressBar.getBoundingClientRect() // rect 是一个具有四个属性left、top、right、bottom的DOMRect对象
        const offsetWidth = e.pageX - rect.left
        this._setStyle(offsetWidth)
        this._triggerPercent()
      }
    },
    watch: {
      progressPercent() {
        // !this.btnTouch.init 非拖动时
        if (this.progressPercent >= 0 && !this.btnTouch.init) {
          const barW = this.$refs.progressBar.clientWidth - BTN_WIDTH
          const leftW = this.progressPercent * barW
          this._setStyle(leftW)
        }
      }
    }
    
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'

.progress-bar
  height 30px
  .bar-inner
    position relative
    top 13px
    height 4px
    background rgba(0, 0, 0, 0.3)
    .progress
      position absolute
      height 100%
      background $color-theme
    .progress-btn-wrapper
      position absolute
      left -8px
      top -13px
      width 30px
      height 30px
      .progress-btn
        position relative
        top 7px
        left 7px
        box-sizing border-box
        width 16px
        height 16px
        border 3px solid $color-text
        border-radius 50%
        background $color-theme
</style>