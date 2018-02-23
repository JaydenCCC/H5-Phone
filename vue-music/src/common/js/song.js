import { getLyric } from 'api/lyric'
import {ERR_OK} from 'api/config'
import { Base64 } from 'js-base64'

export default class Song {
    constructor({ id, mid, singer, name, album, duration, image, url }) {
        this.id = id
        this.mid = mid
        this.singer = singer
        this.name = name
        this.album = album
        this.duration = duration
        this.image = image
        this.url = url
    }

    // 将歌词数据作为Song类的属性，lyric()将在player.vue中currentSong发生变化时执行
    getLyric() {
        // 每次currentSong发生变化时执行这个函数就会发送ajax请求，这显然不合理，如下判断
        if (this.lyric) { // 如果有这个歌词，那么直接返回一个Promise对象
            return Promise.resolve(this.lyric)
        }

        return new Promise((resolve, reject) => {
            getLyric(this.mid).then((res) => {
                if (res.code === ERR_OK) {
                    this.lyric = Base64.decode(res.lyric)
                    resolve(this.lyric)
                } else {
                    // eslint-disable-next-line 
                    reject('no lyric')
                }
            })
        })
    }
}

export function createSong(musicData) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        // url: `http://thirdparty.gtimg.com/C100${musicData.songmid}.m4a?fromtag=38`
        url: `http://isure.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=32`

    })
}

// musicData里面singer的数据结构是数组，需要的是字符串，并且不止一位歌手时用'/'拼接
function filterSinger(singer) {
    let ret = []
    if (!singer) {
        return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    })
    return ret.join('/')
}
