import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/utils'

// 为了适应底部的mini播放器,多个组件需要所以采用mixin,mixin是个对象
export const adaptBottomMixin = {
    computed: {
        ...mapGetters([
            'playlist'
        ])
    },
    mounted() {
        this.adaptBottom(this.playlist)
    },
    // keep-alive 组件激活时调用
    activated() {
        this.adaptBottom(this.playlist)
    },
    watch: {
        playlist(newVal) {
            this.adaptBottom(newVal)
        }
    },
    // 在mounted、activated以及playlist变化时调用的统一方法
    methods: {
        adaptBottom() {
            throw new Error('component must implement adaptBottom method')
        }
    }
}

// 对player.vue 和 playlist.vue的重复代码进行优化(播放相关的mixin)
export const playerMixin = {
    computed: {
        ...mapGetters(['sequenceList', 'currentSong', 'mode', 'playlist', 'favoriteList']),
        // 改变不同播放模式的按钮图标
        playModeIcon() {
            return this.mode === playMode.sequence
                ? 'icon-sequence'
                : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        }
    },
    methods: {
        // 点击按钮改变播放模式（提交mutations）
        changePlayMode() {
            let nextMode = (this.mode + 1) % 3
            this.setPlayMode(nextMode)
            let list = null
            if (nextMode === playMode.random) {
                list = shuffle(this.sequenceList) // 随机播放模式打乱播放列表
            } else {
                list = this.sequenceList
            }
            // this.setPlaylist(list) 不可以直接设置playlist
            // 但是 currentSong 在getters中是根据playlist和currentIndex决定的,此时需要做到切换播放模式的时候currentSong不改变
            this.resetCurrentIndex(list) // 改变歌曲顺序前先重设当前歌曲索引
            this.setPlaylist(list) // 提交mutations改变歌曲顺序
        },
        // 改变播放模式时当前播放歌曲索引发生变化，需要重设索引防止播放列表不可控制
        resetCurrentIndex(list) {
            // findIndex 是es6的数组方法，返回数组中满足条件的第一个元素的索引
            let index = list.findIndex(item => {
                return item.id === this.currentSong.id
            })
            this.setCurrentIndex(index)
        },
        // 是否收藏的图标
        getFavoriteIcon(song) {
            if (this.isFavorite(song)) {
                return 'icon-favorite'
            }
            return 'icon-not-favorite'
        },
        // 是否收藏
        toggleFavorite(song) {
            if (this.isFavorite(song)) {
                this.deleteFavoriteList(song)
            } else {
                this.saveFavoriteList(song)
            }
        },
        isFavorite(song) {
            const index = this.favoriteList.findIndex((item) => {
                return item.id === song.id
            })
            return index > -1
        },
        ...mapMutations({
            setPlayingState: 'SET_PLAYING_STATE',
            setCurrentIndex: 'SET_CURRENT_INDEX',
            setPlayMode: 'SET_PLAY_MODE',
            setPlaylist: 'SET_PLAYLIST'
        }),
        ...mapActions([
            'saveFavoriteList',
            'deleteFavoriteList'
        ])
    }
}

// search 相关的mixin (search.vue 和 add-song)
export const searchMixin = {
    data() {
        return {
            query: '',
            refreshDelay: 100
        }
    },
    computed: {
        ...mapGetters(['searchHistory'])
    },
    methods: {
        // 移动端滑动时收起键盘
        blurInput() {
            this.$refs.searchBox.blur() // blur()是子组件里定义的方法
        },
        // 保存搜索记录
        saveSearch() {
            this.saveSearchHistory(this.query)
        },
        // 监听子组件search-box触发的事件
        onQueryChange(query) {
            this.query = query
        },
        // 点击热门搜索历史添加查询到search-box.vue中
        addQuery(query) {
            this.$refs.searchBox.setQuery(query)
        },
        ...mapActions([
            'saveSearchHistory',
            'deleteSearchHistory'
        ])
    }
}