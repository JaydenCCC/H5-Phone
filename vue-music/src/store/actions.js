import * as types from './mutation-types'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/utils'
import { saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite } from 'common/js/cache'

function findIndex(list, currentSong) {
    return list.findIndex((item) => {
        return item.id === currentSong.id
    })
}

// 点击歌曲播放这一动作涉及到提交多个mutations，因此把他们集合到一个actions里面进行管理
export const selectPlay = function ({ commit, state }, { list, index }) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)
        index = findIndex(randomList, list[index]) // 顺序列表的index对应到随机列表的index
    } else {
        commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_PLAYING_STATE, true)
    commit(types.SET_FULL_SCREEN, true)
}

export const randomPlay = function ({ commit }, { list }) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_PLAYING_STATE, true)
    commit(types.SET_FULL_SCREEN, true)
}

// 点击搜索列表的歌曲，会将该歌曲添加到播放列表，也涉及多个mutations
// 此时涉及到三个state的修改
export const insertSongOfSearch = function ({ commit, state }, song) {
    let playlist = state.playlist.slice() // 用slice()拷贝副本,不要直接修改
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex // 值类型

    // 记录当前歌曲
    let currentSong = playlist[currentIndex]
    // 查找当前播放列表中是否有待插入的歌曲并返回其索引, 一定要先查索引再插入,否则永远都是 existIndex > -1
    let existIndex = findIndex(playlist, song) // 这首歌是否已经在当前播放列表，是则 existIndex > -1
    // 因为是插入歌曲，所以索引 + 1  
    currentIndex++
    // 插入这首歌到当前索引位置
    playlist.splice(currentIndex, 0, song) // 先插入这首歌,然后判断怎么删除原来已在列表中的歌

    // 如果已经包含了这首歌
    if (existIndex > -1) {
        if (currentIndex > existIndex) { // 说明新插入的歌曲在重复歌曲的后面
            playlist.splice(existIndex, 1)
            currentIndex--
        } else {
            playlist.splice(existIndex + 1, 1)
        }
    }

    let currentSequenceIndex = findIndex(sequenceList, currentSong) // 临时变量

    let existSequenceIndex = findIndex(sequenceList, song)

    currentSequenceIndex++
    sequenceList.splice(currentSequenceIndex, 0, song)

    if (existSequenceIndex > -1) {
        if (currentSequenceIndex > existSequenceIndex) {
            sequenceList.splice(existSequenceIndex, 1)
        } else {
            sequenceList.splice(existSequenceIndex + 1, 1)
        }
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

// 保存搜索记录
export const saveSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 删除搜索记录
export const deleteSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 清空搜索记录
export const clearSearchHistory = function ({commit}) {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// playlist.vue中需要 删除一首歌
export const deleteSong = function({commit, state}, song) { // 这个song是要删除的song,不一定是当前播放的
    let playlist = state.playlist.slice() // 用slice()拷贝副本,不要直接修改
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex // 值类型

    // 找到这首歌在playlist的位置
    let pIndex = findIndex(playlist, song)
    playlist.splice(pIndex, 1)

    // 找到这首歌在sequenceList的位置
    let sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)

    // 当前播放的歌曲如果是在删除歌曲的索引之后 || 删除的是最后一首
    if (currentIndex > pIndex || currentIndex === playlist.length) { // 已经删过一个所以length不用-1
        currentIndex--
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)

    // 如果删完这首歌,playlist没有歌曲了
    if (!playlist.length) {
        commit(types.SET_PLAYING_STATE, false)
    }
    //  else {
    //     commit(types.SET_PLAYING_STATE, true)
    // }
    // 优化
    // const playingState = playlist.length > 0
    // commit(types.SET_PLAYING_STATE, playingState)
}

// 清空播放列表
export const deleteSongList = function({commit}) {
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYING_STATE, false)
}

// 保存到最近播放
export const savePlayHistory = function({commit}, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}

// 保存到收藏列表
export const saveFavoriteList = function({commit}, song) {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function({commit}, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}