# Music

### 一、播放器基本功能
- [x] 歌曲播放、切歌、进度控制
- [x] 三种播放模式
- [x] 搜索歌手、专辑、歌曲
- [x] 上拉加载功能、延迟加载
- [x] Mini播放器控制
- [x] 收藏歌曲

### 二、项目结构

```text
│  App.vue                  // 组件入口
│  main.js                  // js入口
│  
├─api                       // 获取接口数据的文件夹
│      config.js                // 公共配置
│      lyric.js                 // 歌词数据
│      rank.js                  // 排行榜数据
│      rankDetail.js            // 榜单详情数据
│      recommend.js             // 推荐页面相关数据
│      search.js                // 热门搜索
│      singer.js                // 歌手数据
│      
├─base                      // 公用基础组件文件夹
│          
├─common                    // 样式、字体、js工具库文件夹
│          
├─components                // 业务组件文件夹
│          
├─router                    // 路由配置文件夹
│      index.js
│      
└─store                     // vuex配置文件夹
        actions.js              // dispatch
        getters.js              // 计算state数据
        index.js                // vuex入口
        mutations-types.js      // mutations常量
        mutations.js            // commit
        state.js                // 基础数据
```
