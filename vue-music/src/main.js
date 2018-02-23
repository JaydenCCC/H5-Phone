import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import store from './store'

import 'common/stylus/index.styl'

// Vue.config.productionTip = false

fastclick.attach(document.body)

Vue.use(VueLazyLoad, {
  // 设置默认加载的图片 webpack支持require
  loading: require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
