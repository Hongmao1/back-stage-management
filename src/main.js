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
// 导入Vue-Quill-Editor富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios拦截请求
axios.interceptors.request.use(config => {
  // 为请求头对象 设置Authorization
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 全局注册
Vue.component('tree-table', TreeTable)
// 全局富文本注册
Vue.use(VueQuillEditor)

Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
