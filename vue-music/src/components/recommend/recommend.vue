<template>
  <div class="recommend" ref="recommend">
    <!-- 在scroll.vue中 watch data的变化,只要数据变化了就自动 refresh,不需要手动调用 -->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <!-- better-scroll 只有第一个子元素会滚动,所以这里要让轮播slider和歌单都滚动的话在它们的外层套上一个div -->
      <div>
        <div class="slider-wrapper" v-if="recommends.length">
          <slider>
            <div v-for="item in recommends" :key="item.id">
              <a :href="item.linkUrl">
                <img class="needsclick" @load="loadImage" :src="item.picUrl" />
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectDisc(item)" v-for="(item, index) in discList" :key="index" class="item">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl"/>
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- loading -->
      <div v-show="!discList.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import Loading from 'base/loading/loading'
import Scroll from 'base/scroll/scroll'
import Slider from 'base/slider/slider'
import { getRecommend, getDiscList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import { adaptBottomMixin } from 'common/js/mixin'
import { mapMutations } from 'vuex'

export default {
  mixins: [adaptBottomMixin],
  data() {
    return {
      recommends: [],
      discList: []
    }
  },
  created() {
    this._getRecommend()
    this._getDiscList()
  },
  methods: {
    // 实现 mixin 方法
    adaptBottom(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    // 跳转到歌单详情页
    selectDisc(item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      // 存入vuex
      this.setDisc(item)
    },
    _getRecommend() {
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    },
    _getDiscList() {
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
          // console.log(this.discList)
        }
      })
    },
    // 图片加载成功后 轮播slider 的高度就确定了,此时刷新,这样即使 slider 比 歌单 慢加载也不会影响better-scroll
    loadImage() {
      // 这里的 refresh() 是scroll.vue中定义的
      // this.$refs.scroll.refresh()
      // 优化: 防止每一张图片加载成功都刷新浪费资源
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  components: {
    Slider,
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'

.recommend
  position fixed
  width 100%
  top 88px
  bottom 0
  .recommend-content
    height 100%
    overflow hidden
    .slider-wrapper
      position relative
      width 100%
      overflow hidden
    .recommend-list
      .list-title
        height 65px
        line-height 65px
        text-align center
        font-size $font-size-medium
        color $color-theme
      .item
        display flex
        box-sizing border-box
        align-items center
        padding 0 20px 20px 20px
        .icon
          flex 0 0 60px
          width 60px
          padding-right 20px
        .text
          display flex
          flex-direction column
          justify-content center
          flex 1
          line-height 20px
          overflow hidden
          font-size $font-size-medium
          .name
            margin-bottom 10px
            color $color-text
          .desc
            color $color-text-d
    .loading-container
      position absolute
      width 100%
      top 50%
      transform translateY(-50%)
</style>