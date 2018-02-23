import originJSONP from 'jsonp'

export default function jsonp(url, data, option) {
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

    return new Promise((resolve, reject) => {
        // 这里调用原生的jsonp方法, 把处理好的 url 传进去
        originJSONP(url, option, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}

// 对url后面接的数据进行处理
export function param(data) {
    let url = ''
    for (var k in data) {
        // 不能把 undefined 传递给后端, 没有值就传递''
        let value = data[k] !== undefined ? data[k] : ''
        url += `&${k}=${encodeURIComponent(value)}`
    }
    // 把第一个&去掉, substring 并不会改变原字符串, 所以要直接 return 操作后返回的值
    return url ? url.substring(1) : ''
}