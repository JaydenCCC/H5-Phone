<template>
  <div class="singer" ref="singer">
    <listview @select="selectSinger" :singersData="singers" ref="listview"></listview>
    <router-view></router-view>
  </div>
</template>

<script>
import Listview from 'base/listview/listview'
// 这个Singer是定义的一个class
import Singer from 'common/js/singer'
import { ERR_OK } from 'api/config'
import { getSingerList } from 'api/singer'
// 引入vuex的语法糖
import { mapMutations } from 'vuex'
import { adaptBottomMixin } from 'common/js/mixin'

const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10

export default {
  mixins: [adaptBottomMixin],
  data() {
    return {
      singers: []
    }
  },
  created() {
    this._getSingerList()
  },
  methods: {
    // 实现 mixin 方法
    adaptBottom(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.listview.refresh() // Listview组件就是scroll
    },
    // 监听子组件触发的事件,传递过来的参数 item 就是singer,包含id,name,avatar
    selectSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      // 这样 state 里的singer就被赋值了, singer-detail.vue 中就可以取值
      this.setSinger(singer)
    },
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list)
        }
      })
    },
    // 规范化数据结构
    _normalizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        // 前 10 条数据设为热门
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(
            new Singer({
              // 这个id其实是获取图片需要用来拼接的
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            })
          )
        }
        // 歌手名首字母
        const key = item.Findex
        // key 是变量, 不能用 map.key
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(
          // Singer 类定义在common/js/singer.js
          new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          })
        )
      })
      // foreach 结束, 为了得到有序列表,需要处理map
      let hot = []
      // title是字母的对象存放的数组
      let ret = []
      for (let k in map) {
        let val = map[k]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // 排序
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      // 最后函数返回规范化后的 res.data.list, 就可以去开发listview组件了
      return hot.concat(ret)
    },
    // 参数是放在对象里
    ...mapMutations({
      // 配置映射, 拿到了mutations里定义好的方法 SET_SINGER
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    Listview
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.singer
  position fixed
  top 88px
  bottom 0
  width 100%
</style>