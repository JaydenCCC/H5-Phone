import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'
import axios from 'axios'

// 取推荐页面轮播数据
export function getRecommend() {
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

    // commonParams 是共有的属性, 此外还有一些数据要传递
    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        uin: 0,
        needNewCode: 1
    })

    // 返回一个Promise
    return jsonp(url, data, options)
}

// 获取推荐歌单
export function getDiscList() {
    // http://localhost:8080/api/getDiscList 触发后端接口代理, 再访问真正的目标url: https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg
    const url = '/api/getDiscList'

    const data = Object.assign({}, commonParams, {
        platform: 'yqq',
        hostUin: 0,
        sin: 0,
        ein: 29,
        sortId: 5,
        needNewCode: 0,
        categoryId: 10000000,
        rnd: Math.random(),
        // 这次的请求是 ajax 请求, 需要 respnse 是json格式
        format: 'json'
    })

    return axios.get(url, {
        // 后端接口代理中 express 可以通过 request.query 拿到 data
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    })
}

// 获取某一歌单的歌曲
export function getSongsOfDisc(disstid) {
    const url = '/api/getSongsOfDisc'

    const data = Object.assign({}, commonParams, {
        disstid,
        type: 1,
        json: 1,
        utf8: 1,
        onlysong: 0,
        loginUin: 0,
        hostUin: 0,
        needNewCode: 0,
        platform: 'yqq',
        format: 'json'
    })

    return axios.get(url, {
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    })
}