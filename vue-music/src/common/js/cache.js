import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 200 // 最多200首最近播放

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200
 
function insertArray(arr, val, compare, maxLen) { // 定义一个比较函数 compare
    const index = arr.findIndex(compare)
    if (index === 0) {
        return
    }
    if (index > 0) {
        arr.splice(index, 1)
    }
    arr.unshift(val)
    if (maxLen && arr.length > maxLen) {
        // 超过数组最大长度,则踢出最后一个
        arr.pop()
    }
}

function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) {
        arr.splice(index, 1)
    }
}

// 保存搜索记录
export function saveSearch(query) {
    let searches = storage.get(SEARCH_KEY, []) // 第二个参数表示默认值
    insertArray(searches, query, (item) => {
        return item === query
    }, SEARCH_MAX_LENGTH)

    storage.set(SEARCH_KEY, searches)
    return searches
}

// 删除搜索记录
export function deleteSearch(query) {
    let searches = storage.get(SEARCH_KEY, [])
    deleteFromArray(searches, (item) => {
        return item === query
    })
    storage.set(SEARCH_KEY, searches)
    return searches
}

// 清空搜索记录
export function clearSearch() {
    storage.remove(SEARCH_KEY)
    return []
}

// 从localstorage读取数据设初始值,在state中引用
export function loadSearch() {
    return storage.get(SEARCH_KEY, [])
}

// 保存到最近播放
export function savePlay(song) {
    let songs = storage.get(PLAY_KEY, [])
    insertArray(songs, song, (item) => {
        return item.id === song.id
    }, PLAY_MAX_LENGTH)
    storage.set(PLAY_KEY, songs)
    return songs // 返回的这个songs就可以在actions中存入playHistory
}

// 读取
export function loadPlay() {
    return storage.get(PLAY_KEY, [])
}

// 收藏
export function saveFavorite(song) {
    let songs = storage.get(FAVORITE_KEY, [])
    insertArray(songs, song, (item) => {
        return item.id === song.id
    }, FAVORITE_MAX_LEN)
    storage.set(FAVORITE_KEY, songs)
    return songs
}

export function deleteFavorite(song) {
    let songs = storage.get(FAVORITE_KEY, [])
    deleteFromArray(songs, (item) => {
        return item.id === song.id
    }, FAVORITE_MAX_LEN)
    storage.set(FAVORITE_KEY, songs)
    return songs
}

export function loadFavorite() {
    return storage.get(FAVORITE_KEY, [])
}

/**
 *制作一个vue的localstorage插件
 */

// let store = {
//     set(key, value) {
//         localStorage.setItem(key, JSON.stringify(value))
//     },
//     get(key) {
//         return JSON.parse(localStorage.getItem(key)) || {}
//     },
//     removeItem(key) {
//         return localStorage.removeItem(key)
//     },
//     valueOf() {
//         return localStorage.valueOf()
//     }
// }
// let localstorage = {
//     install: function (vm) {
//         vm.prototype.$local = store
//     }
// }
// export default localstorage