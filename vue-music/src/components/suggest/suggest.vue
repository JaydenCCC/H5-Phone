<template>
  <scroll class="suggest" 
          :data="result" 
          :pullup="pullup" 
          :beforeScroll="beforeScroll"
          @scrollToEnd="searchMore"
          ref="suggestScroll"
          @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="(item, index) in result" :key="index">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getShowName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <!-- 写死的值不需要:title -->
      <no-result title="抱歉, 暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { search } from 'api/search'
import { ERR_OK } from 'api/config'
import { createSong } from 'common/js/song'
import Singer from 'common/js/singer' // class
import { mapMutations, mapActions } from 'vuex'
import NoResult from 'base/no-result/no-result'

const TYPE_SINGER = 'singer'
const PER_PAGE = 20

export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      // 规范后的所需数据
      result: [],
      pullup: true,
      beforeScroll: true,
      hasMore: true
    }
  },
  methods: {
    refresh() { // 父组件会调用这个方法
      this.$refs.suggestScroll.refresh()
    },
    _search() {
      // 三个初始化设置，否则会有bug, this._search()是watch到query变化之后调用的,所以每次应该重置
      this.hasMore = true
      this.page = 1
      this.$refs.suggestScroll.scrollTo(0, 0)

      search(this.query, this.page, this.showSinger, PER_PAGE).then((res) => {
        if (res.code === ERR_OK) {
          this.result = this._normalizeResult(res.data)
          this._checkMore(res.data)
        }
      })
    },
    // 从服务器返回的结果中取出需要的规范数据
    _normalizeResult(data) {
      let ret = []
      if (data.zhida && data.zhida.singerid) {
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }
      if (data.song) {
        ret = ret.concat(this._normalizeSongs(data.song.list))
      }
      return ret
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((musicData) => {
        if (musicData.songid && musicData.albumid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine' // 搜索结果是歌手
      } else {
        return 'icon-music' // 搜索结果是音乐
      }
    },
    getShowName(item) {
      // console.log(item)
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    // 判断是否还有搜索出的数据
    _checkMore(data) {
      const song = data.song // song是个对象
      if (!song.list.length || (song.curnum + song.curpage * PER_PAGE) > song.totalnum) {
        this.hasMore = false
      }
    },
    // 监听到scroll触发的滑动到底部的事件时查找更多 
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, PER_PAGE).then((res) => {
        if (res.code === ERR_OK) {
          // 这时候是拼接,不是赋值了
          this.result = this.result.concat(this._normalizeResult(res.data))
          this._checkMore(res.data)
        }
      })
    },
    // 点击搜索出来的内容跳转到SingerDetail组件
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSongOfSearch(item) // item 就是song
      }
      this.$emit('saveHistory')
    },
    // 移动端滑动时收起键盘
    listScroll() {
      this.$emit('listScroll')
    },
    // 和Singer到SingerDetail一样,通过vuex传递参数实现通讯
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSongOfSearch'
    ])
  },
  watch: {
    query() {
      this._search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.suggest
  height 100%
  overflow hidden
  .suggest-list
    padding 0 30px
    .suggest-item
      display flex
      align-items center
      padding-bottom 20px
    .icon
      flex 0 0 30px
      width 30px
      [class^='icon-']
        font-size 14px
        color $color-text-d
    .name
      flex 1
      font-size $font-size-medium
      color $color-text-d
      overflow hidden
      .text
        no-wrap()
  .no-result-wrapper
    position absolute
    width 100%
    top 50%
    transform translateY(-50%)
</style>