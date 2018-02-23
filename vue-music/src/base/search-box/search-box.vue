<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" :placeholder="placeholder" v-model="query"/>
    <i class="icon-dismiss" v-show="query" @click="clearQuery"></i>
  </div>
</template>

<script>
import { debounce } from 'common/js/utils'

  export default {
    props: {
      placeholder: {
        type: String,
        default: '搜索歌曲,歌手'
      }
    },
    data() {
      return {
        query: ''
      }
    },
    methods: {
      // 清除搜索条件
      clearQuery() {
        this.query = ''
      },
      // 在父组件中调用这个方法
      setQuery(query) {
        this.query = query
      },
      // 在父组件中调用这个方法
      blur() {
        this.$refs.query.blur()
      }
    },
    created() {
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery)
      }, 200))
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'

.search-box
  display flex
  align-items center
  box-sizing border-box
  width 100%
  padding 0 6px
  height 40px
  background $color-highlight-background
  border-radius 6px
  .icon-search
    font-size 24px
    color $color-background
  .box
    flex 1
    margin 0 5px
    line-height 18px
    background $color-highlight-background
    color $color-text
    font-size $font-size-medium
    &::placeholder
      color $color-text-d
  .icon-dismiss
    font-size 16px
    color $color-background
</style>