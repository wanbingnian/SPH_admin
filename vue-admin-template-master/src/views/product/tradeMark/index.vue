<template>
  <div>
    <el-button
      type="primary"
      icon="el-icon-plus"
      style="margin: 10px 0"
      @click="showDialog"
      >添加</el-button
    >

    <!-- 表格组件 -->
    <el-table style="width: 100%" border :data="list">
      <el-table-column
        type="index"
        label="序号"
        width="80px"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="tmName"
        label="品牌名称"
        width="width"
      ></el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="updataTradeMark(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTradeMark(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--
       分页器 
       @size-change="handleSizeChange"
       @current-change="handleCurrentChange"
      -->
    <el-pagination
      style="margin-top: 20px; textAlign: center"
      :current-page="page"
      :total="total"
      :page-size="limit"
      :page-count="7"
      :page-sizes="[3, 5, 10]"
      @current-change="getPageList"
      @size-change="handleSizeChange"
      layout=" prev, pager, next, jumper,->,total, sizes"
    >
    </el-pagination>
    <!-- 
         对话框
         :visible.sync --- 控制对话框显示与隐藏
      -->
    <el-dialog
      :title="this.tradeMark.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <!--
         form表单 
         :rules="rules" element 表单验证
      -->
      <el-form style="width: 80%" :rules="rules" :model="tradeMark" ref="ruleForm">
        <el-form-item label="品牌名称" label-width="100px"  prop="tmName">
          <el-input autocomplete="off" v-model="tradeMark.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="tradeMark.logoUrl"
              :src="tradeMark.logoUrl"
              class="avatar"   
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "tradeMark",
  data() {
    //自定义校验规则
      var validateTmName = (rule, value, callback) => {
          if(value.length<2 || value.length>10){
            callback(new Error('品牌名称2-10位'))
          }else{
            callback()
          }
      };
    return {
      page: 1,
      limit: 3,
      total: 0,
      //列表展示的数据
      list: [],
      //控制对话框显示与隐藏
      dialogFormVisible: false,
      //收集品牌信息
      tradeMark: {
        tmName: "",
        logoUrl: "",    
      },
      rules: {
          tmName: [
            { required: true, message: "请输品牌名称", trigger: "blur" },
            // 自定义校验规则
            { validator: validateTmName, trigger: 'change' }
          ],
          logoUrl: [
            { required: true, message: "请选择品牌图片", trigger: "change" },
          ],
        },
    };
  },
  mounted() {
    this.getPageList();
  },
  methods: {
    //获取品牌列表数据 和 页面跳转
    async getPageList(pager = 1) {
      this.page = pager
      const { page, limit } = this;
      let result = await this.$API.trademark.reqTradeMarkList(page, limit);
      if (result.code == 200) {
        this.list = result.data.records;
        this.total = result.data.total;
      }
    },
    //修改一页展示几条数据时触发
    handleSizeChange(limit) {
      this.limit = limit;
      this.getPageList();
    },
    //点击添加显示对话框
    showDialog() {
      this.dialogFormVisible = true;
      //清除对话框
      this.tradeMark = {tmName:'',logoUrl:''}
    },
    // 点击修改显示对话框
    updataTradeMark(row) {
      this.dialogFormVisible = true;
      // 浅拷贝
      this.tradeMark = { ...row };
    },
    //上传成功的回调
    handleAvatarSuccess(res, file) {
      // res,file是上传成功服务器返回前端的数据
      this.tradeMark.logoUrl = res.data;
    },
    //图片上传之前的回调
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    // 添加 or 修改 按钮
    addOrUpdateTradeMark() {
      //所有表单验证通过才能添加 or 修改
      this.$refs.ruleForm.validate(async(success)=>{
    if(success){
          //隐藏对话框
          this.dialogFormVisible = false;
          //发请求
          let result = await this.$API.trademark.reqAddOrUpdateTradeMark(
            this.tradeMark
          );
          if (result.code == 200) {
            //添加 or 修改品牌成功
            this.$message({
              message: this.tradeMark.id ? "修改品牌成功" : "添加品牌成功",
              type: "success",
            });
           this.getPageList(this.tradeMark.id ? this.page : 1);
          }
         }
      })
    },
    //删除按钮
    deleteTradeMark(row){
      //提示弹框
       this.$confirm(`确认删除${row.tmName}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          //用户点击确定按钮触发
          let result = await this.$API.trademark.reqDeleteTradeMark(row.id)
          if(result.code == 200){
             this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getPageList(this.list.length>1?this.page:this.page-1)
          }
          
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    }
  },
};
</script>

    

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>