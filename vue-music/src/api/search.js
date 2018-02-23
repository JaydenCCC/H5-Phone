import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'

// 热门搜索
export function getHotKey() {
    const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
    // "code": 0,
    // "data": {
    // "hotkey": [
    //     {
    //     "k": "周杰伦 ",
    //     "n": 426502
    //     },
    //     {
    //     "k": "说散就散 ",
    //     "n": 985070
    //     }
    // ]

    const data = Object.assign({}, commonParams, {
        platform: 'yqq',
        needNewCode: 0
    })

    return jsonp(url, data, options)
}

// 搜索时的suggest列表
export function search(query, page, zhida, perpage) {
    const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

    const data = Object.assign({}, commonParams, {
        w: query,
        p: page,
        perpage,
        n: perpage,
        catZhida: zhida ? 1 : 0,
        zhidaqu: 1,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        remoteplace: 'txt.mqq.all',
        uin: 0,
        needNewCode: 1,
        platform: 'h5'
    })

    return jsonp(url, data, options)
}
