import Vue from 'vue'
import {
  Button, Form, FormItem, Input, Message, Container, Main, Aside,
  Header, Menu, MenuItem, Submenu, Breadcrumb, BreadcrumbItem, Card,
  Row, Col, Table, TableColumn, Switch, Tooltip, Pagination, Dialog,
  MessageBox, Tag, Tree, Select, Option, Cascader
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)

// 挂载定义message
Vue.prototype.$message = Message
// 挂载定义MessageBox
Vue.prototype.$confirm = MessageBox.confirm
