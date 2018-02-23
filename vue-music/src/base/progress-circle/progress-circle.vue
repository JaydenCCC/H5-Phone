<template>
  <!-- 这个svg就是一条圆形的金色进度条 -->
  <div class="progress-circle">
    <!-- viewBox 视窗的100对应直径2*r,cx和cy决定圆心坐标 stroke-dasharray表示描边距离(周长[金色]) stroke-dashoffset表示偏移量(剩余进度[暗淡])-->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashoffset" />
    </svg>
    <!-- slot 就是mini播放器控制播放暂停的按钮 -->
    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: {
      radius: {
        type: Number,
        default: 100
      },
      progressPercent: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 50 * 2
      }
    },
    computed: {
      dashoffset() {
        return (1 - this.progressPercent) * this.dashArray
      } 
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>