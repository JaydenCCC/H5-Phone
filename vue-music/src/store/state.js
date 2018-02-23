import { playMode } from 'common/js/config'
import { loadSearch, loadPlay, loadFavorite } from 'common/js/cache'

const state = {
    singer: {},
    playingState: false,
    mode: playMode.sequence,
    fullScreen: false,
    playlist: [],
    sequenceList: [],
    currentIndex: -1,
    disc: {},
    // rank 的数据
    topList: {},
    // 需要从localstorage中读取
    searchHistory: loadSearch(),
    playHistory: loadPlay(), // 播放历史 在player.vue中audio触发canplay事件中设置
    favoriteList: loadFavorite()
}

export default state