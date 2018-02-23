<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <!-- 这个scroll组件有两个值需要监听发生改变重新计算高度,所以computed中计算shortcut -->
      <scroll ref="shortcutScroll" class="shortcut" :data="shortcut" :refreshDelay="refreshDelay">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" class="item" v-for="(item, index) in hotKey" :key="index">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list @select="addQuery" @delete="deleteSearchHistory" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div ref="searchResult" class="search-result" v-show="query">
      <suggest ref="suggestScroll" @saveHistory="saveSearch" @listScroll="blurInput" :query="query"></suggest>
    </div>
    <confirm @confirm="clearSearchHistory" ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空"></confirm>
    <!-- Search组件对应的二级路由也是SingerDetail组件 Suggest子组件负责跳转-->
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from 'base/search-box/search-box'
import { getHotKey } from 'api/search'
import { ERR_OK } from 'api/config'
import Suggest from 'components/suggest/suggest'
import SearchList from 'base/search-list/search-list'
import Confirm from 'base/confirm/confirm'
import Scroll from 'base/scroll/scroll'
import { mapActions } from 'vuex'
import { adaptBottomMixin, searchMixin } from 'common/js/mixin'

export default {
  mixins: [adaptBottomMixin, searchMixin],
  created() {
    this._getHotKey()
  },
  data() {
    return {
      // refreshDelay: 100, mixin中
      hotKey: []
      // query: '',
    }
  },
  computed: {
    // 把scroll刷新高度需要监听的两个值合并, 要写在computed中
    shortcut() {
      return this.hotKey.concat(this.searchHistory)
    }
    // ...mapGetters(['searchHistory']) mixin
  },
  methods: {
    adaptBottom(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcutScroll.refresh()

      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggestScroll.refresh() // 调用子组件的方法
    },
    // // 点击热门搜索历史添加查询到search-box.vue中
    // addQuery(query) {
    //   this.$refs.searchBox.setQuery(query)
    // },
    // // 监听子组件search-box触发的事件
    // onQueryChange(query) {
    //   this.query = query
    // },
    _getHotKey() {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.slice(0, 10) // 取前十条热门搜索记录
        }
      })
    },
    // // 移动端滑动时收起键盘
    // blurInput() {
    //   this.$refs.searchBox.blur() // blur()是子组件里定义的方法
    // },
    // // 保存搜索记录
    // saveSearch() {
    //   this.saveSearchHistory(this.query)
    // },
    showConfirm() {
      this.$refs.confirm.show()
    },
    // actions方法可以直接在点击事件中调用
    // deleteOne(item) { // item 是子组件触发事件传递过来的
    //   this.deleteSearchHistory(item)
    // }
    ...mapActions([
      // 'saveSearchHistory',
      // 'deleteSearchHistory',
      'clearSearchHistory'
    ])
  },
  watch: {
    query(newQuery) {
      // 从搜索列表suggest 点击按钮x切换到 主页search 时,query的变化实际上是从有到无, 此时手动刷新scroll才能滚动
      if (!newQuery) {
        setTimeout(() => {
          this.$refs.shortcutScroll.refresh()
        }, 20)
      }
    }
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.search
  .search-box-wrapper
    margin 20px
  .shortcut-wrapper
    position fixed
    top 178px
    bottom 0
    width 100%
    .shortcut
      height 100%
      overflow hidden
      .hot-key
        margin 0 20px 20px 20px
        .title
          margin-bottom 20px
          font-size $font-size-medium
          color $color-text-l
        .item
          display inline-block
          padding 5px 10px
          margin 0 20px 10px 0
          border-radius 6px
          background $color-highlight-background
          font-size $font-size-medium
          color $color-text-d
      .search-history
        position relative
        margin 0 20px
        .title
          display flex
          align-items center
          height 40px
          font-size $font-size-medium
          color $color-text-l
          .text
            flex 1
          .clear
            extend-click()
            .icon-clear
              font-size $font-size-medium
              color $color-text-d
  .search-result
    position fixed
    width 100%
    top 178px
    bottom 0
</style>