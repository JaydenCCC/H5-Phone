<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item, index) in dots" :key="index" :class="{active: currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script>
import { addClass } from 'common/js/dom'
import BScroll from 'better-scroll'

export default {
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  data() {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  mounted() {
    setTimeout(() => {
      this._setSliderWidth()
      // 小圆点要在滑块之前初始化(为了拿到正确的div(child)个数)
      this._initDots()
      this._initSlider()

      if (this.autoPlay) {
        this._play()
      }
    }, 20)

    // 监听视窗改变时调整slider大小
    window.addEventListener('resize', () => {
      if (!this.slider) {
        return
      }
      this._setSliderWidth(true)
      this.slider.refresh()
    })
  },
  methods: {
    _setSliderWidth(isResize) {
      this.children = this.$refs.sliderGroup.children

      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        // 拿到 sliderGroup 中的每个div (div里是包裹着图片的a标签)
        let child = this.children[i]
        // 使用封装好的方法为每个div添加 slider-item 这个类
        addClass(child, 'slider-item')

        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }

      // 在mounted中第一次调用时不传参,isResize就是undefined,!isResize则为true
      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        // 当快速滑动时是否开启滑动惯性
        momentum: false,
        // 该属性是给 slider 组件使用的，普通的列表滚动不需要配置
        snap: true,
        // 是否可以无缝循环轮播
        snapLoop: this.loop,
        // 0.1 滑动的长度限制，只有大于这个距离才会触发事件
        snapThreshold: 0.3,
        // 400, 轮播图切换的动画时间
        snapSpeed: 400
      })

      // 在这个事件中获得当前坐标
      this.slider.on('scrollEnd', () => {
        let pageIndex = this.slider.getCurrentPage().pageX
        // 如果 loop 属性 为true还要减去克隆的那个,因为要获得真实的当前index
        if (this.loop) {
          pageIndex -= 1
        }
        this.currentPageIndex = pageIndex

        if (this.autoPlay) {
          // 假设快要四秒的时候被手动切换, 不清除就会出现问题
          clearTimeout(this.timer)
          // 清除完再调用, setTimeout 才可以做到 setInterval 的效果
          this._play()
        }
      })
    },
    _initDots() {
      // 用正确的children的长度来初始化小圆点数组的长度(loop为true为了实现无缝循环会在前后克隆一个child,长度被改变,所以要先初始化小圆点)
      this.dots = new Array(this.children.length)
    },
    _play() {
      // 自动跳到下一张
      let pageIndex = this.currentPageIndex + 1
      // 如果 loop 属性 为true这里是要 +1 (注意是 pageIndex + 1 而且不要赋值给 this.currentPageIndex,以免影响小圆点 )
      // 因为克隆的两个是在第一个和最后一个,实际上要跳的那一个是要算上第一个克隆的div,所以长度加1, 但是不是真实的index, 所以不要赋值给this.currentPageIndex
      if (this.loop) {
        pageIndex += 1
      }
      this.timer = setTimeout(() => {
        // 方法的参数是 pageIndex(跳到哪一张), 第二个参数是代表y方向(只需有横向轮播,所以为0), 第三个参数和snapSpeed保持一致
        this.slider.goToPage(pageIndex, 0, 400)
      }, this.interval)
    }
  },
  // 当组件中用到了计时器时，要在destroyed中进行clearTimeout，释放内存资源，这是一种好的编程习惯
  destroyed() {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'

.slider
  min-height 1px
  .slider-group
    position relative
    overflow hidden
    white-space nowrap
    .slider-item
      float left
      box-sizing border-box
      overflow hidden
      text-align center
      a
        display block
        width 100%
        overflow hidden
        text-decoration none
      img
        display block
        width 100%
  .dots
    position absolute
    right 0
    left 0
    bottom 12px
    text-align center
    font-size 0
    .dot
      display inline-block
      margin 0 4px
      width 8px
      height 8px
      border-radius 50%
      background $color-text-l
      &.active
        width 20px
        border-radius 5px
        background $color-text-ll
</style>