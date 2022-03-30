<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog()">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- tree-table 区域 -->
      <tree-table class="tree-table" :data="CateList" :columns="columns" index-text="#"
        :selection-type="false" :expand-type="false" show-index :show-row-hover="false" border>
        <!-- 判断是否有效区域 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>
        <!-- 排序区域 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作区域 -->
        <template slot="opt" slot-scope="scope">
          <!-- slot-scope="scope" -->
          <el-button type="primary" icon="el-icon-edit" size="mini"
            @click="showEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"
            @click="removeCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%"
      @close="addCateDialogClosed">
      <!-- 文本 -->
      <el-form :model="addCateForm" :rules="addCaterules" ref="addCateFormRef" label-width="90px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options是指定数据源 -->
          <!-- prop是指定配置对象 -->
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="casacaderProps"
            @change="parentCateChanged" clearable change-on-select>
          </el-cascader>

        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%">
      <!-- 文本 -->
      <el-form :model="editForm" :rules="editrules" ref="editFormRef" label-width="90px"
        class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3, pagenum: 1, pagesize: 5
      },
      // 商品信息数据
      CateList: [],
      // 总数据
      total: 0,
      // 为table提供数据类型
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt' }
      ],
      // 添加分类对话框显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单
      addCateForm: {
        // 添加分类名称
        cat_name: '',
        // 添加分类等级
        cat_level: '',
        // 父级分类的Id
        cat_pid: ''
      },
      // 添加分类表单规则
      addCaterules: {
        cat_name: [
          { required: true, message: '请输入添加分类名称', tiggle: 'blur' }
        ]
      },
      // 指定级联选择器配置对象
      casacaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
        // checkStrictly: 'true'
      },
      // 级联选中父级id数组
      selectedKeys: [],
      // 父级分类列表
      parentCateList: [],
      // 编辑分类对话框
      editDialogVisible: false,
      // 编辑表单分类规则
      editrules: {
        cat_name: [
          { required: true, message: '请输入编辑当前分类名称', tiggle: 'blur' }
        ]
      },
      // 编辑表单
      editForm: {
        id: '',
        cat_name: ''
      }
    }
  },

  created () {
    this.getCatesList()
  },

  methods: {
    // 获取CateList请求+
    async getCatesList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品信息失败！')
      // 请求成功后赋值
      this.CateList = res.data.result
      this.total = res.data.total
      // console.log(res.data)
    },
    // 监听 pagsize 的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCatesList()
      // console.log(newSize)
    },
    // 监听 pagenum 分页的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCatesList()
      // console.log(newPage)
    },
    // 展示添加分类对话框
    showAddDialog () {
      // 获取父级分类信息
      this.getparemtCateList()

      // 显示对话框
      this.addCateDialogVisible = true
    },
    // 获取parentCateList事件
    async getparemtCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！')
      // 赋值
      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    // 级联选择器发生变化触发事件
    parentCateChanged () {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        // 父级iD赋值
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 确认按钮事件，添加新分类
    addCate () {
      // console.log(this.addCateForm)
      // 判断表单验证是否通过后再发起请求
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        // 发起添加请求
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
        console.log(res.data)
        this.$message.success(res.meta.msg)
        // 刷新页面
        this.getCatesList()
        // 关闭对话框
        this.addCateDialogVisible = false
      })
    },
    // 添加分类对话关闭事件，重置表单数据
    addCateDialogClosed () {
      // 清空选中Id
      this.selectedKeys = []
      // 清空表单数据
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 展示编辑分类对话框
    showEditDialog (data) {
      this.editDialogVisible = true
      // console.log(data)
      this.editForm.cat_name = data.cat_name
      this.editForm.id = data.cat_id
    },
    // 提交编辑好分类事件
    editCate () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editForm.id, { cat_name: this.editForm.cat_name })
        // console.log(res.meta.status)
        if (res.meta.status !== 200) return this.$message.error('更新分类失败！')
        this.$message.success(res.meta.msg)
        // 刷新页面
        this.getCatesList()
        // 编辑表单清空
        this.$refs.editFormRef.resetFields()
        // 关闭对话框
        this.editDialogVisible = false
      })
    },
    // 删除分类事件
    async removeCate (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      console.log(typeof (confirmResult))
      if (confirmResult !== 'confirm') {
        this.$message.info('已取消删除')
      }
      // remove程序
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败！')
      this.$message.success(res.meta.msg)
      this.getCatesList()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }
</style>
