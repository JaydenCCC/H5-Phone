<template>
  <!-- 在add-song中被引用 -->
  <ul class="switches">
    <li @click="switchItem(index)" class="switch-item" v-for="(item,index) in switches" :key="index" :class="{'active':currentIndex === index}">
      <span>{{item.name}} </span>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    switches: {
      type: Array,
      default: () => {
        return []
      }
    },
    currentIndex: {
      type: Number,
      default: 0
    }
  },
  methods: {
    switchItem(index) {
      // 基础组件并不实现任何业务逻辑,只是告诉外部被切换了(最近播放/搜索历史)
      this.$emit('switch', index)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'

.switches
  display flex
  align-items center
  width 240px
  margin 0 auto
  border 1px solid $color-highlight-background
  border-radius 5px
  .switch-item
    flex 1
    padding 8px
    text-align center
    font-size $font-size-medium
    color $color-text-d
    &.active
      background $color-highlight-background
      color $color-text
</style>