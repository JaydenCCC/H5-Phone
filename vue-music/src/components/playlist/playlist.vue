<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <!-- playModeIcon 方法是mixin里的 -->
            <i class="icon" :class="playModeIcon" @click="changePlayMode"></i>
            <span class="text">{{playModeText}}</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <!-- 因为scroll中的动画会导致延时20ms刷新高度不够,所以需要传入refreshDelay -->
        <scroll :data="sequenceList" :refreshDelay="refreshDelay" ref="listContent" class="list-content">
          <!-- transition-group的子元素需要:key -->
          <transition-group name="list" tag="ul">
            <li @click="selectItem(item, index)" ref="listItem" class="item" v-for="item in sequenceList" :key="item.id">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span @click.stop="toggleFavorite(item)" class="like">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <!-- 本需要 @click.stop="addSong" 但是因为 addSong 这个方法就是显示add-song这个组件,直接在这个组件里@click.stop阻止向上冒泡即可-->
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div @click="hide" class="list-close">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" @confirm="confirmClear" text="是否清空播放列表" confirmBtnText="清空"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
import Scroll from 'base/scroll/scroll'
// import { mapGetters, mapMutations, mapActions } from 'vuex' // 引用的mixin里有
import { mapActions, mapGetters } from 'vuex'
import { playMode } from 'common/js/config'
import Confirm from 'base/confirm/confirm'
import { playerMixin } from 'common/js/mixin'
import AddSong from 'components/add-song/add-song'

export default {
  mixins: [playerMixin],
  data() {
    return {
      showFlag: false,
      refreshDelay: 100 // &.list-enter-active, &.list-leave-active 是100ms
    }
  },
  computed: {
    // ...mapGetters(['sequenceList', 'currentSong', 'mode', 'playlist']) // 引用的mixin中有
    ...mapGetters(['playingState']),
    playModeText() {
      return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
    }
  },
  methods: {
    show() {
      this.showFlag = true
      // 发现无法滚动是因为组件从display: none 到显示, scroll需要刷新
      setTimeout(() => {
        this.$refs.listContent.refresh()
        this.scrollToCurrentSong(this.currentSong)
      }, 20)
    },
    hide() {
      this.showFlag = false
    },
    getCurrentIcon(item) {
      if (this.currentSong.id === item.id) {
        return 'icon-play'
      }
      return ''
    },
    // 点击歌曲
    selectItem(item, index) {
      if (this.mode === playMode.random) {
        index = this.playlist.findIndex((song) => {
          return song.id === item.id
        })
      }
      this.setCurrentIndex(index)
      this.setPlayingState(true)
    },
    // 列表滚动到当前歌曲,滚动的时机是watch到currentSong的变化时
    scrollToCurrentSong(current) {
      const index = this.sequenceList.findIndex((song) => {
        return current.id === song.id
      })
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300) // 跳到指定的li
    },
    // 调用actions中封装好的方法删除某一首歌
    deleteOne(item) {
      this.deleteSong(item)
      if (!this.playlist.length) {
        this.hide()
      }
      this.$emit('afterDelete', this.playingState)
    },
    showConfirm() {
      this.$refs.confirm.show()
    },
    // 调用actions的方法清空播放列表
    confirmClear() {
      this.deleteSongList()
      this.hide()
    },
    addSong() {
      this.$refs.addSong.show()
    },
    // ...mapMutations({ // 引用的mixin中有
    //   setCurrentIndex: 'SET_CURRENT_INDEX',
    //   setPlayingState: 'SET_PLAYING_STATE'
    // }),
    ...mapActions([
      'deleteSong',
      'deleteSongList'
    ])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!this.showFlag || newSong.id === oldSong.id) {
        return
      }
      this.scrollToCurrentSong(newSong)
    }
  },
  components: {
    Scroll,
    Confirm,
    AddSong
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.playlist
  position fixed
  left 0
  right 0
  top 0
  bottom 0
  z-index 200
  background-color $color-background-d
  &.list-fade-enter-active, &.list-fade-leave-active
    transition opacity 0.3s
    .list-wrapper
      transition all 0.3s
  &.list-fade-enter, &.list-fade-leave-to
    opacity 0
    .list-wrapper
      transform translate3d(0, 100%, 0)
  &.list-fade-enter, .list-wrapper
    position absolute
    left 0
    bottom 0
    width 100%
    background-color $color-highlight-background
    .list-header
      position relative
      padding 20px 30px 10px 20px
      .title
        display flex
        align-items center
        .icon
          margin-right 10px
          font-size 30px
          color $color-theme-d
        .text
          flex 1
          font-size $font-size-medium
          color $color-text-l
        .clear
          extend-click()
          .icon-clear
            font-size $font-size-medium
            color $color-text-d
    .list-content
      max-height 240px
      overflow hidden
      .item
        display flex
        align-items center
        height 40px
        padding 0 30px 0 20px
        overflow hidden
        &.list-enter-active, &.list-leave-active
          transition all 0.1s
        &.list-enter, &.list-leave-to
          height 0
        .current
          flex 0 0 20px
          width 20px
          font-size $font-size-small
          color $color-theme-d
        .text
          flex 1
          no-wrap()
          font-size $font-size-medium
          color $color-text-d
        .like
          extend-click()
          margin-right 15px
          font-size $font-size-small
          color $color-theme
          .icon-favorite
            color $color-sub-theme
        .delete
          extend-click()
          font-size $font-size-small
          color $color-theme
    .list-operate
      width 140px
      margin 20px auto 30px auto
      .add
        display flex
        align-items center
        padding 8px 16px
        border 1px solid $color-text-l
        border-radius 100px
        color $color-text-l
        .icon-add
          margin-right 5px
          font-size $font-size-small-s
        .text
          font-size $font-size-small
    .list-close
      text-align center
      line-height 50px
      background $color-background
      font-size $font-size-medium-x
      color $color-text-l
</style>