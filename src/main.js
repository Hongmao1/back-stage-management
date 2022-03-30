import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import '../src/assets/css/global.css'
// 导入axios
import axios from 'axios'
// 导入'vue-table-with-tree-grid'组件
import TreeTable from 'vue-table-with-tree-grid'

// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios拦截请求
axios.interceptors.request.use(config => {
  // 为请求头对象 设置Authorization
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 全局注册
Vue.component('tree-table', TreeTable)

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
