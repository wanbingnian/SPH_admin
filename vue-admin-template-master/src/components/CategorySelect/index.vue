<template>
  <div>
    <el-form :inline="true"  class="demo-form-inline">
     <el-form-item label="一级分类" :model="cForm">
        <el-select  placeholder="请选择" v-model="cForm.category1Id" @change="handler1" :disabled="show">
          <el-option :label="c1.name" :value="c1.id" v-for="(c1,index) in list1" :key="c1.id"></el-option>
        </el-select>
      </el-form-item>
     <el-form-item label="二级分类" :model="cForm">
        <el-select  placeholder="请选择" v-model="cForm.category2Id" @change="handler2" :disabled="show">
          <el-option :label="c2.name" :value="c2.id" v-for="(c2,index) in list2" :key="c2.id"></el-option>
        </el-select>
      </el-form-item>
     <el-form-item label="三级分类" :model="cForm">
        <el-select  placeholder="请选择" v-model="cForm.category3Id" @change="handler3" :disabled="show">
          <el-option :label="c3.name" :value="c3.id" v-for="(c3,index) in list3" :key="c3.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
   data() {
      return {
         //一级分类数据
         list1:[],
         //二级分类数据
         list2:[],
         //三级分类数据
         list3:[],
         //收集相应123级分类id
         cForm:{
         category1Id:'',
         category2Id:'',
         category3Id:'',
         }
      }
   },
   props:['show'],
  name: "CategorySelect",
  //组件挂载完毕就发请求获取一级分类数据
  mounted(){
   this.getCategory1Id()
  },
  methods:{
  async getCategory1Id(){
     let result = await this.$API.attr.reqCategory1List()
     if(result.code == 200){
        this.list1 = result.data
     }
   },
   //一级分类select时事件回调（当一级option变化时 携带一级id获取二级数据）
   async handler1(){
      //清除 2 3 select数据
      this.list2 = [],
      this.list3 = [],
      this.cForm.category2Id = '',
      this.cForm.category3Id = ''
      //解构id
      const {category1Id} = this.cForm;
      this.$emit('getCategoryId',{categoryId:category1Id,level:1})
      let result = await this.$API.attr.reqCategory2List(category1Id)
      if(result.code == 200){
        this.list2 = result.data
      }
   },
   //二级select事件回调（当二级option变化时 携带一级id获取三级数据）
   async handler2(){
      // 清除 3 select 数据
      this.list3 = [],
      this.cForm.category3Id = ''
      const {category2Id} = this.cForm;
      this.$emit('getCategoryId',{categoryId:category2Id,level:2})
      let result = await this.$API.attr.reqCategory3List(category2Id)
      if(result.code == 200){
         this.list3 = result.data
      }
   },
   //三级select事件回调
   handler3(){
     const {category3Id} = this.cForm;
     this.$emit('getCategoryId',{categoryId:category3Id,level:3})
   }
  }
};
</script>

<style>
</style>