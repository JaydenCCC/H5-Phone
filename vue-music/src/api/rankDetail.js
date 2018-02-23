import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'

// 榜单详情数据
export function getRankDetail(topid) {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
    const data = Object.assign({}, commonParams, {
        topid: topid,
        platform: 'h5',
        needNewCode: 1,
        tpl: 3,
        page: 'detail',
        type: 'top'
    })

    return jsonp(url, data, options)
}