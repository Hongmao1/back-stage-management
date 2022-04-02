<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加按钮区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select"
            clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
              @click="showEditDialog(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
              @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagsize" layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品列表
      goodsList: [],
      // query表单
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总数据
      total: 0
    }
  },

  created () {
    this.getGoodsList()
  },

  methods: {
    // 获取商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')
      this.$message.success('获取商品列表成功！')
      console.log(res.data)
      this.total = res.data.total
      this.goodsList = res.data.goods
    },
    // 监听pagesize的变化
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听pagenum的变化
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除商品列表事件
    async removeById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 判断是否删除
      if (confirmResult !== 'confirm') return this.$message.info('您取消了删除！')
      // 删除请求
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取商品信息失败！')
      console.log(res.data)
      this.editForm = res.data

      this.editDialogVisible = true
    },
    goAddpage () {
      this.$router.push('goods/add')
    },
    Edit () {
      this.$refs.editFormRef.validate(valid => {
        console.log(valid)
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-col-8 {
    margin: 0 20px;
  }

  .el-pagination {
    margin-top: 15px;
  }
</style>
