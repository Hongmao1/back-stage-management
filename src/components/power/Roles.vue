<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1 === 0 ? 'bdtop': '','vcenter']"
              v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 一级标签 -->
              <el-col :span="5">
                <el-tag @close="removeRightsById(scope.row,item1.id)" closable>{{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级 -->
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' :'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" @close="removeRightsById(scope.row,item2.id)" closable>
                      {{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag v-for="(item3,) in item2.children" :key="item3.id" type="warning"
                      @close="removeRightsById(scope.row,item3.id)" closable>
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini"
              @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色对话框 -->
      <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%">
        <!-- 表单区域 -->
        <el-form :model="addRoleForm" :rules="roleRules" ref="roleFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 添加权限对话框 -->
      <el-dialog title="添加权限" :visible.sync="setRightDialogVisible" width="50%"
        @close="defKey = []">
        <!-- 树形图区域 -->
        <el-tree :data="rightsList" :props="treeProps" node-key="id" show-checkbox
          default-expand-all :default-checked-keys="defKey" ref="treeRef"></el-tree>
        <!-- 按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],
      // 添加角色对话框显示或隐藏
      addDialogVisible: false,
      // 添加角色表单
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加权限对话框框显示或隐藏
      setRightDialogVisible: false,
      // 定义所有权限的数组
      rightsList: [],
      // 添加角色验证规则
      roleRules: {
        roleName: [
          { required: true, message: '请输入角色名称!', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述！', triggle: 'blur' }
        ]
      },
      // 树形控件绑定的属性对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中字节Id值数组
      defKey: [],
      // 当前分配权限的id
      roleId: []
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取roles列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.rolesList = res.data
      // console.log(res)
    },
    // 添加角色按钮事件
    addRole () {
      // 显示对话框
      this.addDialogVisible = true
    },
    // 对话框确认发送请求事件
    async addRoles () {
      const { data: res } = await this.$http.post('roles', this.addRoleForm)
      if (res.meta.status !== 201) return this.$message.error('添加角色失败！')
      this.$message.success(res.meta.msg)
      // 重新获取数据
      this.getRolesList()
      this.addDialogVisible = false
      // 清空表单数据
      this.$refs.roleFormRef.resetFields()
    },
    // 对话框取消事件
    cancel () {
      this.addDialogVisible = false
      // 清空表单数据
      this.$refs.roleFormRef.resetFields()
    },
    // 删除标签事件
    async removeRightsById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('您取消了删除！')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('三级标签删除失败！')
      this.$message.success(res.meta.msg)
      // 重新赋值给children
      role.children = res.data
      // console.log('remove!')
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 选中的id给data
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败！')
      // 把获取的数据保存到data中
      this.rightsList = res.data
      console.log(this.rightsList)

      // 获取所有的第三级标签Id
      this.getLeafKey(role, this.defKey)
      // 展示树形结构
      this.setRightDialogVisible = true
    },
    // 通过递归的方式，获取角色的第三级ID并保存到defKey
    getLeafKey (node, arr) {
      // 判断当前节点是否有children
      if (!node.children) {
        return arr.push(node.id)
      }
      // 递归
      node.children.forEach(item => this.getLeafKey(item, arr))
    },
    // 分配确认事件
    async allotRights () {
      const key = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 进行分割转字符处理
      const idStr = key.join(',')
      // 发起请求
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配用户权限失败！')
      this.$message.success('分配用户权限成功！')
      // 刷新角色list
      this.getRolesList()
      // 关闭对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin:  7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
