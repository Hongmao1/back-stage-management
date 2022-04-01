<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 注意 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 级联选择区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedKeys" :options="cat_List" :props="cateProps"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs 页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick()">
        <el-tab-pane label="动态参数" name="many">
          <!-- 按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数
          </el-button>
          <!-- 动态表格显示 -->
          <el-table :data="manyTableDate" border script>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                  @close="handleClose(i,scope.row)">{{item}}
                </el-tag>
                <!-- 添加输入区域 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini"
                  @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini"
                  @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性
          </el-button>

          <!-- 静态表格显示 -->
          <el-table :data="onlyTableDate" border script>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                  @close="handleClose(i,scope.row)">{{item}}
                </el-tag>
                <!-- 添加输入区域 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <!-- 索引 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini"
                  @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini"
                  @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%"
      @close="addDialogClosed">
      <!-- 文本表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%"
      @close="editDialogClosed">
      <!-- 文本表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品列表
      cat_List: [],
      // 级联选择配置
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中的key
      selectedKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态数据
      manyTableDate: [],
      // 静态数据
      onlyTableDate: [],
      // 添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数表单
      addForm: {
        attr_name: ''
      },
      // 添加参数表单规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', tiggle: 'blur' }
        ]
      },
      // 修改参数表单
      editForm: {
        attr_name: ''
      },
      // 修改参数表单规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', tiggle: 'blur' }
        ]
      },
      // 修改对话框显示与隐藏
      editDialogVisible: false,
      // input输入框显示与隐藏
      inputVisible: false,
      // input输入值
      inputValue: ''
    }
  },

  created () {
    this.getCatesList()
  },

  methods: {
    // 获取商品列表
    async getCatesList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')
      this.cat_List = res.data
      // console.log(res.data)
    },
    // 监听级联变化
    handleChange () {
      this.getParamsDate()
    },
    // 监听tabs的变化
    handleTabClick () {
      console.log(this.activeName)
      this.getParamsDate()
    },
    // 获取参数的数据函数
    async getParamsDate () {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableDate = []
        this.onlyTableDate = []
        return
      }
      // 已经选中三级标签
      // console.log(this.selectedKeys)
      // 根据所选的id获取对应数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
      // 在赋值之前在对attr_val转换数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 添加input属性与定义隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      // 获取成功
      console.log(res.data)
      // 判断是静态数据还是动态
      if (this.activeName === 'many') {
        this.manyTableDate = res.data
      } else {
        this.onlyTableDate = res.data
      }
    },
    // 监听对话框关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数请求
    async addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
        this.$message.success('添加参数成功！')
        // 刷新数据
        this.getParamsDate()
        // 关闭对话框
        this.addDialogVisible = false
      })
    },
    // 展示修改对话框
    async showEditDialog (attrid) {
      // 查询当前参数数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrid}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数数据失败！')
      this.editForm = res.data
      console.log(res.data)
      // this.editattr_id = attrid
      this.editDialogVisible = true
    },
    // 确认表单，并确定发送事件
    editParams () {
      // 判断表单是否合法
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起请求
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) return this.$message.error('更新参数失败！')
        this.$message.success('更新参数成功！')
        // 刷新
        this.getParamsDate()
        // 关闭对话框
        this.editDialogVisible = false
      })
    },
    // 修改对话框关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 删除参数事件
    async removeParams (attrid) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('您取消了删除！')
      // 删除请求
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrid}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数成功！')
      this.getParamsDate()
    },
    // input输入框失去焦点和按下enter
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // 如果没有retrun说明输入内容，进行下一步处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      // 发起请求
      this.saveAttrVals(row)
    },
    // 添加按钮按下展示文本框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 监听tag标签关闭事件
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    // 保存与发送attr_vals请求
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败！')
      this.$message.success('修改参数项成功！')
    }
  },
  computed: {
    // 计算按钮是否被禁用
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 计算获取级联选中的key
    cateId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // title计算
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 120px;
  }
</style>
