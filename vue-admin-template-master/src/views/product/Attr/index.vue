<template>
  <div>
    <el-card style="margin: 20px 0">
      <CategorySelect @getCategoryId="getCategoryId" :show="!isShowTable"></CategorySelect>
    </el-card>
    <el-card>
      <div v-show="isShowTable">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttr"
          :disabled="!category3Id"
          >添加属性</el-button
        >
        <el-table :data="attrList" style="width: 100%" border>
          <el-table-column
            type="index"
            label="序号"
            width="80px"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="attrName"
            label="属性名称"
            width="150px"
          ></el-table-column>
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
                style="margin: 0 10px"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150px">
            <template slot-scope="{ row, $index }">
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="updateAttr(row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowTable">
        <el-form :inline="true" ref="form" label-width="80px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrInfo.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrInfo.attrName"
          >添加属性值</el-button
        >
        <el-button @click="isShowTable = true">取消</el-button>
        <el-table
          style="width: 100%; margin: 15px 0"
          border
          :data="attrInfo.attrValueList"
        >
          <el-table-column align="center" prop="prop" label="序号" width="80px">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-input
                :ref="$index"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                size="mini"
                v-if="row.flag"
                @blur="toLook(row)"
                @keyup.native.enter="toLook(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display: block"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-popconfirm :title="`确定删除${row.valueName}吗？`" @onConfirm="deleteAttrValue($index)">
                <el-button type="danger" size="mini" icon="el-icon-delete" slot="reference">删除</el-button>
              </el-popconfirm>
             
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="addOrUpdateAttr">保存</el-button>
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
//引入深拷贝
import cloneDeep from "lodash/cloneDeep";
export default {
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowTable: true,
      attrInfo: {
        attrName: "", //属性名
        attrValueList: [
          //属性名中的属性值 为多个所以是数组
        ],
        categoryId: 0, //category3Id
        categoryLevel: 3,
      },
    };
  },
  name: "Attr",
  methods: {
    //自定义事件回调（获取子传来的id展示数据）
    getCategoryId({ categoryId, level }) {
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
      } else {
        //当有了三级分类id才发请求
        this.category3Id = categoryId;
        //发请求获取品牌属性
        this.getAttrList();
      }
    },
    //获取平台品牌属性
    async getAttrList() {
      const { category1Id, category2Id, category3Id } = this;
      let result = await this.$API.attr.reqAttrList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code == 200) {
        this.attrList = result.data;
      }
    },
    //添加属性值回调
    addAttrValue() {
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id,
        valueName: "",
        flag: true, //给每个属性添加一个信号量来控制编辑模式和查看模式的隐藏与现显示
      });
      this.$nextTick(() => {
        this.$refs[this.attrInfo.attrValueList.length - 1].focus();
      });
    },
    //添加属性按钮回调(再次点击清空数据，收集三级id)
    addAttr() {
      // table隐藏
      this.isShowTable = false;
      // 清空数据
      // 并收集三级id
      this.attrInfo = {
        attrName: "", //属性名
        attrValueList: [
          //属性名中的属性值 为多个所以是数组
        ],
        categoryId: this.category3Id, //category3Id
        categoryLevel: 3,
      };
    },
    //修改某一属性
    updateAttr(row) {
      this.isShowTable = false;
      //由于attrInfo里存在对象套数组，数组里又套对象所有用到深拷贝
      this.attrInfo = cloneDeep(row);
      //在修改某一属性时，将对应的属性值元素加上flag标记
      this.attrInfo.attrValueList.forEach((item) => {
        //注意 这里不能 item.flag = false (因为flag不是响应式的)
        // vue无法检测到这种新增属性，要用this.$set() 才可以变为响应式属性
        this.$set(item, "flag", false);
      });
    },
    //失去焦点 or enter键 切换为查看模式
    toLook(row) {
      //输入值不能为空,空格
      if (row.valueName.trim() == "") {
        this.$message("请输入有效属性值");
        return;
      }
      //row是最新新增的属性值
      // 因为不能添加重复属性值，需要遍历 同事去除自己
      let isReapeat = this.attrInfo.attrValueList.some((item) => {
        if (row !== item) {
          return row.valueName == item.valueName;
        }
      });
      if (isReapeat) return;
      console.log(isReapeat);
      row.flag = false;
    },
    //点击span变回编辑模式
    toEdit(row, index) {
      row.flag = true;
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    deleteAttrValue(index){
       //此操作不需要发请求
       //element版本2.15.1 高于 此项目的 2.13.x 所有conform事件 改为 onConform
       this.attrInfo.attrValueList.splice(index,1)
    },
    //保存按钮回调
    async addOrUpdateAttr(){
      //过滤后再把attrInfo上传给服务器（上传的内容不应该出现flag字段和空数据）
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(item => {
          if(item.valueName !== ''){
            delete item.flag
            return true
          }
       })
       try {
        //发请求
        await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo)
        //保存后让isShowTable为真
        this.isShowTable = true
        this.$message({type:'success',message:'保存成功'})
         //保存成功后再次获取平台属性进行展示
        this.getAttrList()
       } catch (error) {
         this.$message('保存失败！')
       }
       
    }
  },
};
</script>

<style>
</style>