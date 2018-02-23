<template>
    <div class="player" v-show="playlist.length>0">
        <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img width="100%" height="100%" :src="currentSong.image">
                </div>
                <div class="top">
                    <div class="back" @click="back">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title" v-html="currentSong.name"></h1>
                    <h2 class="subtitle" v-html="currentSong.singer"></h2>
                </div>
                <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
                    <div class="middle-l" ref="middleL">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="rotateCD">
                                <img class="image" :src="currentSong.image">
                            </div>
                        </div>
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">{{playingLyric}}</div>
                        </div>
                    </div>
                    <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric">
                                <p ref="lyricLine" class="text" :class="{'current': currentLineNum === index}" v-for="(line, index) in currentLyric.lines" :key="index">{{line.txt}}</p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active': currentDot === 'cd'}"></span>
                        <span class="dot" :class="{'active': currentDot === 'lyric'}"></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="time time-l">{{formatTime(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :progressPercent="progressPercent" @percentChange="percentChange"></progress-bar>
                        </div>
                        <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left" @click="changePlayMode">
                            <i :class="playModeIcon"></i>
                        </div>
                        <div class="icon i-left" :class="NoReadyAddCls">
                            <i @click="prevSong" class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class="NoReadyAddCls">
                            <i @click="togglePlayingState" :class="togglePlayIcon"></i>
                        </div>
                        <div class="icon i-right" :class="NoReadyAddCls">
                            <i @click="nextSong" class="icon-next"></i>
                        </div>
                        <div class="icon i-right">
                            <i class="icon" @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen" @click="openNormalPlayer">
                <div class="icon">
                    <img width="40" height="40" :src="currentSong.image" :class="rotateCD">
                </div>
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <p class="desc" v-html="currentSong.singer"></p>
                </div>
                <!-- 需要阻止冒泡, 否则点击时也会触发父元素的 openNormalPlayer 事件 -->
                <div class="control">
                    <progress-circle :radius="radius" :progressPercent="progressPercent">
                        <i @click.stop="togglePlayingState" :class="toggleMiniPlayIcon" class="icon-mini"></i>
                    </progress-circle>
                </div>
                <div class="control" @click.stop="showPlaylist">
                    <i class="icon-playlist"></i>
                </div>
            </div>
        </transition>
        <playlist ref="playlist" @afterDelete="afterDelete"></playlist>
        <!-- 把oncanplay改成了onplay -->
        <audio :src="currentSong.url" ref="audio" @canplay="canplay" @error="error" @timeupdate="getCurrentTime" @ended="onSongOver">
        </audio>
    </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import animations from 'create-keyframe-animation'
import { prefixStyle } from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import { playMode } from 'common/js/config'
// import { shuffle } from 'common/js/utils' 转移到mixin
import LyricParser from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import Playlist from 'components/playlist/playlist'
import { playerMixin } from 'common/js/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
  mixins: [playerMixin],
  data() {
    return {
      canBePlayed: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentDot: 'cd',
      playingLyric: ''
    }
  },
  created() {
    this.touch = {} // 这个对象用于存储左右滑动时的信息, 不需要添加getter和setter所以写在created中
  },
  computed: {
    togglePlayIcon() {
      // 根据this.playingState改变图标播放/暂停的class
      return this.playingState ? 'icon-pause' : 'icon-play'
    },
    toggleMiniPlayIcon() {
      return this.playingState ? 'icon-pause-mini' : 'icon-play-mini'
    },
    rotateCD() {
      // CD图片是否旋转
      return this.playingState ? 'play' : 'play pause'
    },
    // 歌曲还未canplay时需要添加的class
    NoReadyAddCls() {
      return this.canBePlayed ? '' : 'disable'
    },
    // 传递当前歌曲的进度百分比给子组件
    progressPercent() {
      return this.currentTime / this.currentSong.duration
    },
    // 改变不同播放模式的按钮图标 移到mixin里, 和playlist.vue共用
    // playModeIcon() {
    //   return this.mode === playMode.sequence
    //     ? 'icon-sequence'
    //     : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    // },
    ...mapGetters([
    //   'playlist', // 引用的mixin里有
    //   'currentSong',
    //   'mode',
    //   'sequenceList',
      'fullScreen',
      'playingState',
      'currentIndex'
    ])
  },
  methods: {
    // 与playlist组件相关的方法开始
    showPlaylist() {
      this.$refs.playlist.show() // 调用子组件的方法
    },
    // 与playlist组件相关的方法结束
    back() {
      this.setFullScreen(false)
    },
    // 点击歌曲打开播放器
    openNormalPlayer() {
      this.setFullScreen(true)
    },
    // 设置切换大小播放器时的动画
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale()

      let animation = {
        // 0 是小圆的位置
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }

      // 注册
      animations.registerAnimation({
        name: 'move',
        animation,
        // 预设字段
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })

      // 运行 给大圆(this.$refs.cdWrapper)加动画
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    // enter 是小圆到大圆的动画, leave 是大圆到小圆的动画, afterEnter 和 afterLeave 清除动画
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      // 动画结束要调用 done 函数 进入afterLeave
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    // 得到 大圆中心点 到 小圆中心点 的偏移量和缩放, 用来设置 0% 时候小圆的位置
    _getPosAndScale() {
      const targetWidth = 40
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const x = -(window.innerWidth / 2 - paddingLeft) // 大圆 到 小圆 的translate属性的x需要负数
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom // 圆的宽高一样
      return {
        x,
        y,
        scale
      }
    },
    // 点击提交mutations改变playingState的状态,但是真正控制播放暂停的是audio播放器,所以通过watch这个playingState的状态来播放暂停歌曲
    togglePlayingState() {
      if (!this.canBePlayed) {
        return
      }
      this.setPlayingState(!this.playingState)
      if (this.currentLyric) {
        this.currentLyric.togglePlay() // lyricBug：修复歌曲暂停时歌词继续滚动BUG
      }
    },
    prevSong() {
      if (!this.canBePlayed) {
        return
      }
      // 特殊情况：如果playlist只有一首歌,currentIndex还是设为0并没有改变,不判断则不能watch到currentSong的变化
      if (this.playlist.length === 1) {
        this.loopSong()
        return
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playingState) {
          this.togglePlayingState()
        }
      }

      this.canBePlayed = false
    },
    nextSong() {
      // audio的canpaly事件还没触发时canBePlayed标识为false
      if (!this.canBePlayed) {
        return
      }
      // 特殊情况：如果playlist只有一首歌,currentIndex还是设为0并没有改变,不判断则不能watch到currentSong的变化
      if (this.playlist.length === 1) {
        this.loopSong()
        return
      } else {
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playingState) {
          this.togglePlayingState()
        }
      }

      this.canBePlayed = false
    },
    // audio标签带的监听事件 @canplay="canplay" 触发时执行的方法
    canplay() {
      this.canBePlayed = true // 标识：歌曲canplay时置为true
      this.savePlayHistory(this.currentSong) // actions的方法, 保存到最近播放
    },
    // audio标签带的监听事件 @error="error"
    error() {
      // 假设用户点击下一首,网络错误或者下一首歌的url有问题的时候, 会导致 this.canBePlayed 永远不能为true
      // 所以为了防止加载歌曲出错时播放器挂起
      this.canBePlayed = true
    },
    // 通过audio的@timeupdate事件监听当前播放时间
    getCurrentTime(e) {
      this.currentTime = e.target.currentTime // e.target 就是audio,取它的属性currentTime
    },
    // 格式化时间为分:秒
    formatTime(seconds) {
      seconds = seconds | 0
      let minute = (seconds / 60) | 0
      let second = this._pad(seconds % 60)
      return `${minute}:${second}`
    },
    // 把时间统一变为两位数
    _pad(num, n = 2) {
      let length = num.toString().length
      while (length < n) {
        num = '0' + num
        length++
      }
      return num
    },
    // 接收progress-bar组件派发的拉动进度条事件，这时改变歌曲播放进度
    percentChange(newPercent) {
      const currentTime = newPercent * this.currentSong.duration
      // this.currentTime = newPercent * this.currentSong.duration 这样是不能达到效果的
      this.$refs.audio.currentTime = currentTime
      // 拖动进度条时如果歌曲是暂停状态的，拖动结束后播放
      // this.setPlayingState(true) 以下写法更好
      if (!this.playingState) {
        this.togglePlayingState()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000) // lyricBug: 修复拉动进度条时歌词不跟随BUG 单位毫秒
      }
    },

    // // 点击按钮改变播放模式（提交mutations） 转移到mixin
    // changePlayMode() {
    //   let nextMode = (this.mode + 1) % 3
    //   this.setPlayMode(nextMode)
    //   let list = null
    //   if (nextMode === playMode.random) {
    //     list = shuffle(this.sequenceList) // 随机播放模式打乱播放列表
    //   } else {
    //     list = this.sequenceList
    //   }
    //   // this.setPlaylist(list) 不可以直接设置playlist
    //   // 但是 currentSong 在getters中是根据playlist和currentIndex决定的,此时需要做到切换播放模式的时候currentSong不改变
    //   this.resetCurrentIndex(list) // 改变歌曲顺序前先重设当前歌曲索引
    //   this.setPlaylist(list) // 提交mutations改变歌曲顺序
    // },

    // 改变播放模式时当前播放歌曲索引发生变化，需要重设索引防止播放列表不可控制 转移到mixin
    // resetCurrentIndex(list) {
    //   // findIndex 是es6的数组方法，返回数组中满足条件的第一个元素的索引
    //   let index = list.findIndex(item => {
    //     return item.id === this.currentSong.id
    //   })
    //   this.setCurrentIndex(index)
    // },
    
    // @ended 歌曲播放结束时的逻辑
    onSongOver() {
      if (this.mode === playMode.loop) {
        this.loopSong()
      } else {
        this.nextSong() // 调用下一首的方法
      }
    },
    loopSong() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      this.setPlayingState(true)
      if (this.currentLyric) {
        this.currentLyric.seek(0) // lyricBug:修复单曲循环结束时歌词不回到开头BUG
      }
    },
    // 获取歌词
    _getLyric() {
      this.currentSong.getLyric().then(lyric => {
        if (this.currentSong.lyric !== lyric) { // 防止切歌太快歌词出bug
          return
        }

        this.currentLyric = new LyricParser(lyric, this.lyricCallback)
        if (this.playingState) {
          this.currentLyric.play()
        }
      })
      .catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    // 歌词每一行改变时调用这个回调，lineNum表示当前歌词所在行数
    lyricCallback({ lineNum, txt }) {
      this.currentLineNum = lineNum // 根据设置当前行 高亮
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5] // p标签
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt // 当前播放的那一句歌词
    },
    // 切换cd与歌词界面
    middleTouchStart(e) {
      this.touch.init = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove(e) {
      if (!this.touch.init) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX // 往左滑动deltaX是负数
      const deltaY = touch.pageY - this.touch.startY // 往上滑动deltaY是负数
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // 纵向滚动歌词
        return
      }
      // 两种情况下 lyric界面初始translateX的值
      const tranLeft = this.currentDot === 'cd' ? 0 : -window.innerWidth
      // 取[0, -window.innerWidth]的值就是歌词界面左滑的值
      const finalLeft = Math.min(
        0,
        Math.max(-window.innerWidth, tranLeft + deltaX)
      )
      this.touch.leftPercent = finalLeft / -window.innerWidth
      this.$refs.lyricList.$el.style[transform] = `translate3d(${finalLeft}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      this.$refs.middleL.style.opacity = 1 - this.touch.leftPercent // 歌词左滑越多,cd越透明
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd() {
      let finalLeft
      let opacity
      if (this.currentDot === 'cd') {
        if (this.touch.leftPercent > 0.1) {
          finalLeft = -window.innerWidth
          opacity = 0 // cd界面完全透明
          this.currentDot = 'lyric'
        } else {
          finalLeft = 0
          opacity = 1
        }
      } else {
        // 此时是lyric界面,判断右滑是不是超过百分10
        if (this.touch.leftPercent < 0.9) {
          finalLeft = 0
          opacity = 1
          this.currentDot = 'cd'
        } else {
          finalLeft = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${finalLeft}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms` // @touchmove 时time要设为0
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    },
    afterDelete(state) {
      this.setPlayingState(state)
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    //   setPlayingState: 'SET_PLAYING_STATE', 转移到mixin
    //   setCurrentIndex: 'SET_CURRENT_INDEX',
    //   setPlayMode: 'SET_PLAY_MODE',
    //   setPlaylist: 'SET_PLAYLIST'
    }),
    ...mapActions([
        'savePlayHistory'
    ])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!newSong.id) {
        // !newSong.id 是为了防止删除最后一首歌曲之后,没有了newSong会导致 error: this.currentSong.getLyric is not a function
        return
      }
      if (newSong.id === oldSong.id) {
        return
      }
      if (this.currentLyric) {
        this.currentLyric.stop() // lyricBug:修复切歌时歌词跳动BUG，实际上是在歌词改变前清除旧的定时器
        this.currentTime = 0
        this.playingLyric = ''
        this.currentLineNum = 0
        this.setPlayingState(true)
      }
      this.$nextTick(() => {
          this.$refs.audio.play()
          this._getLyric()
      })
      // clearTimeout(this.timer)
      // this.timer = setTimeout(() => {
      //   // 为了保证手机/微信从后台再切到前台歌曲可以正常播放 用setTimeout时间比this.$nextTick延迟更久
      //   this.$refs.audio.play()
      //   this._getLyric()
      // }, 1000)
    },
    playingState() {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        this.playingState ? audio.play() : audio.pause()
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.player
    .normal-player
        position fixed
        left 0
        right 0
        top 0
        bottom 0
        z-index 150
        background $color-background
        .background
            position absolute
            left 0
            top 0
            width 100%
            height 100%
            z-index -1
            opacity 0.6
            filter blur(20px)
        .top
            position relative
            margin-bottom 25px
            .back
                position absolute
                top 0
                left 6px
                z-index 50
                .icon-back
                    display block
                    padding 9px
                    font-size $font-size-large-x
                    color $color-theme
                    transform rotate(-90deg)
            .title
                width 70%
                margin 0 auto
                line-height 40px
                text-align center
                no-wrap()
                font-size $font-size-large
                color $color-text
            .subtitle
                line-height 20px
                text-align center
                font-size $font-size-medium
                color $color-text
        .middle
            position fixed
            width 100%
            top 80px
            bottom 170px
            white-space nowrap
            font-size 0
            .middle-l
                display inline-block
                vertical-align top
                position relative
                width 100%
                height 0
                padding-top 80%
                .cd-wrapper
                    position absolute
                    left 10%
                    top 0
                    width 80%
                    height 100%
                    .cd
                        width 100%
                        height 100%
                        box-sizing border-box
                        border 10px solid rgba(255, 255, 255, 0.1)
                        border-radius 50%
                        &.play
                            animation rotate 20s linear infinite
                        &.pause
                            animation-play-state paused
                        .image
                            position absolute
                            left 0
                            top 0
                            width 100%
                            height 100%
                            border-radius 50%
                .playing-lyric-wrapper
                    width 80%
                    margin 30px auto 0 auto
                    overflow hidden
                    text-align center
                    .playing-lyric
                        height 20px
                        line-height 20px
                        font-size $font-size-medium
                        color $color-text-l
            .middle-r
                display inline-block
                vertical-align top
                width 100%
                height 100%
                overflow hidden
                .lyric-wrapper
                    width 80%
                    margin 0 auto
                    overflow hidden
                    text-align center
                    .text
                        line-height 32px
                        color $color-text-l
                        font-size $font-size-medium
                        &.current
                            color $color-text
        .bottom
            position absolute
            bottom 50px
            width 100%
            .dot-wrapper
                text-align center
                font-size 0
                .dot
                    display inline-block
                    vertical-align middle
                    margin 0 4px
                    width 8px
                    height 8px
                    border-radius 50%
                    background $color-text-l
                    &.active
                        width 20px
                        border-radius 5px
                        background $color-text-ll
            .progress-wrapper
                display flex
                align-items center
                width 80%
                margin 0px auto
                padding 10px 0
                .time
                    color $color-text
                    font-size $font-size-small
                    flex 0 0 30px
                    line-height 30px
                    width 30px
                    &.time-l
                        text-align left
                    &.time-r
                        text-align right
                .progress-bar-wrapper
                    flex 1
            .operators
                display flex
                align-items center
                .icon
                    flex 1
                    color $color-theme
                    &.disable
                        color $color-theme-d
                    i
                        font-size 30px
                .i-left
                    text-align right
                .i-center
                    padding 0 20px
                    text-align center
                    i
                        font-size 40px
                .i-right
                    text-align left
                .icon-favorite
                    color $color-sub-theme
        &.normal-enter-active, &.normal-leave-active
            transition all 0.4s
            .top, .bottom
                transition all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
        &.normal-enter, &.normal-leave-to
            opacity 0
            .top
                transform translate3d(0, -100px, 0)
            .bottom
                transform translate3d(0, 100px, 0)
    .mini-player
        display flex
        align-items center
        position fixed
        left 0
        bottom 0
        z-index 180
        width 100%
        height 60px
        background $color-highlight-background
        &.mini-enter-active, &.mini-leave-active
            transition all 0.4s
        &.mini-enter, &.mini-leave-to
            opacity 0
        .icon
            flex 0 0 40px
            width 40px
            padding 0 10px 0 20px
            img
                border-radius 50%
                &.play
                    animation rotate 10s linear infinite
                &.pause
                    animation-play-state paused
        .text
            display flex
            flex-direction column
            justify-content center
            flex 1
            line-height 20px
            overflow hidden
            .name
                margin-bottom 2px
                no-wrap()
                font-size $font-size-medium
                color $color-text
            .desc
                no-wrap()
                font-size $font-size-small
                color $color-text-d
        .control
            flex 0 0 30px
            width 30px
            padding 0 10px
            .icon-play-mini, .icon-pause-mini, .icon-playlist
                font-size 30px
                color $color-theme-d
            .icon-mini
                font-size 32px
                position absolute
                left 0
                top 0
@keyframes rotate
    0%
        transform rotate(0)
    100%
        transform rotate(360deg)
</style>