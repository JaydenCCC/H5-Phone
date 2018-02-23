<template>
  <!-- 父组件 Singer 传递过来的 singers 数组被 props 里的 singersData 数组接收, 再用 :data 传递给 scroll 子组件 -->
  <scroll class="listview" :data="singersData" ref="listview" :listenScroll="listenScroll" @scroll="scroll" :probeType="probeType">
    <ul>
      <li class="list-group" v-for="(group, index) in singersData" :key="index" ref="listGroup">
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li class="list-group-item" v-for="(item, index) in group.items" :key="index" @click="selectItem(item)">
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li class="item" v-for="(item, index) in shortcutList" :key="index" :data-index="index" :class="{'current':currentIndex===index}">
          {{ item }}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixedTitle">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>
    <div v-show="!singersData.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Loading from 'base/loading/loading'
import { getData } from 'common/js/dom'
import Scroll from 'base/scroll/scroll'

// 通过css样式算出每个字母锚点的高度是18  12 + 3 * 2(padding)
const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  created() {
    // 只是为了让两个函数可以获得这个值,并不需要监测它的变化,所以不需要写在Vue的data方法中
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    // 要监听实时滚动,不截流就不能是1了
    this.probeType = 3
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  props: {
    // 从父组件 Singer 接收到的 singersData, 再传递给自己的子组件 Scroll ,让 Scroll 接收 data 并 watch
    singersData: {
      type: Array,
      // 根据 eslint 的 vue/require-valid-default-prop 规则, prop的 default 的类型如果是 Array 或 Object,就要使用函数返回,否则报错
      // 也可以选择用 // eslint-disable-next-line 来忽略此处的规则。
      // 甚至可以在 .eslintrc.js 中关闭规则 'vue/require-valid-default-prop': 0, 就可以直接 default: []
      default: () => {
        return []
      }
    }
  },
  computed: {
    // 获取右侧字母快速入口的列表
    shortcutList() {
      // map() 方法会返回一个新数组
      return this.singersData.map(group => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      return this.singersData[this.currentIndex]
        ? this.singersData[this.currentIndex].title
        : ''
    }
  },
  methods: {
    // singer.vue 中会调用该方法 this.$refs.listview.refresh()
    refresh() {
      this.$refs.listview.refresh()
    },
    selectItem(item) {
      this.$emit('select', item)
    },
    // better-scroll的事件 @touchstart 触发时执行的方法
    onShortcutTouchStart(e) {
      let anchorIndex = getData(e.target, 'index')

      // 获取touch时手指的位置给onShortcutTouchMove函数使用
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      // console.log(this.$refs.listGroup[anchorIndex]) 可以拿到DOM元素 因为每个有 ref="listGroup" 都会找到,通过索引就可以找到具体哪一个,类似DOM的 class="listGroup"
      this._scrollTo(anchorIndex)
    },
    // 字母快速入口滑动时执行的方法 @touchmove.stop.prevent="onShortcutTouchMove"
    onShortcutTouchMove(e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      // 先计算y轴上的偏移量, 然后除以每个字母锚点的高度并向下取整 | 0 等于 Math.floor()
      let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0
      // 因为 this.touch.anchorIndex 是通过 getData 方法拿到的字符串, 如果不转成数字会发现滚动有问题
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    // 触发事件时执行的方法 @scroll="scroll" Listview这个父组件监听了子组件Scroll触发的事件
    scroll(pos) {
      // 获得滚动的实时纵坐标 这个坐标并不是鼠标的坐标,而是整个listview的顶部(可以理解为热门上面的那条线)
      // (从热门往Z滑动: 手指往上滑)得到的 scrollY 是负数的, scrollY 只要大于等于0就是热门
      this.scrollY = pos.y
    },
    _scrollTo(index) {
      // 点击字母快速入口的热门上方和Z下方也会高亮, 点击时的index为null
      if (index === null) {
        return
      }
      // 解决滑动字母快速入口的问题
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      this.scrollY = -this.listHeight[index]
      // scrollToElement(el, time, offsetX, offsetY, easing) 滚动到某个元素，el（必填）表示 dom 元素
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    _calculateHeight() {
      // 每次watch调用本方法的时候先重置this.listHeight
      this.listHeight = []
      // 拿到全部的组(热门组, A组...)  注意 list 并不是DOM元素,但是遍历它的每个item就是DOM元素
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)

      list.forEach((item, index) => {
        height += item.clientHeight
        this.listHeight.push(height)
      })
    }
  },
  watch: {
    singersData() {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    scrollY(newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部, newY > 0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }

      // 当在中间部分滚动
      // listHeight 多push了一个0高度, 比 this.$refs.listGroup 长度多1, 所以减去
      for (let i = 0; i < listHeight.length - 1; i++) {
        // [height1 ,height2) 下限 height1,上限 height2(不包括)
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          // 上限到顶部的距离 height2 - (-newY)
          this.diff = height2 + newY
          return
        }
      }

      // 当滚动到底部, 且 -newY 大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    },
    diff(newVal) {
      // newVal - TITLE_HEIGHT 是负值
      let fixedTop =
        newVal > 0 && newVal < TITLE_HEIGHT ? newVal - TITLE_HEIGHT : 0
      // 减少渲染DOM
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixedTitle.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'

.listview
  position relative
  width 100%
  height 100%
  overflow hidden
  background $color-background
  .list-group
    padding-bottom 30px
    .list-group-title
      height 30px
      line-height 30px
      padding-left 20px
      font-size $font-size-small
      color $color-text-l
      background $color-highlight-background
    .list-group-item
      display flex
      align-items center
      padding 20px 0 0 30px
      .avatar
        width 50px
        height 50px
        border-radius 50%
      .name
        margin-left 20px
        color $color-text-l
        font-size $font-size-medium
  .list-shortcut
    position absolute
    z-index 30
    right 0
    top 50%
    transform translateY(-50%)
    width 20px
    padding 20px 0
    border-radius 10px
    text-align center
    background $color-background-d
    font-family Helvetica
    .item
      padding 3px
      line-height 1
      color $color-text-l
      font-size $font-size-small
      &.current
        color $color-theme
  .list-fixed
    position absolute
    top 0
    left 0
    width 100%
    .fixed-title
      height 30px
      line-height 30px
      padding-left 20px
      font-size $font-size-small
      color $color-text-l
      background $color-highlight-background
  .loading-container
    position absolute
    width 100%
    top 50%
    transform translateY(-50%)
</style>
