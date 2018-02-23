import axios from 'axios'
import { commonParams } from './config'

// 歌词数据
export function getLyric(mid) {
    const url = '/api/getLyric'
    const data = Object.assign({}, commonParams, {
        pcachetime: +new Date(),
        songmid: mid,
        hostUin: 0,
        platform: 'yqq',
        needNewCode: 0,
        format: 'json'
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}