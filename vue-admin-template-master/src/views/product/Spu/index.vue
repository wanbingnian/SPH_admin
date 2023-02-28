<template>
   <div>
   <el-card style="margin:20px 0">
     <CategorySelect @getCategoryId="getCategoryId" :show="scene != 0"></CategorySelect>
   </el-card>
   <el-card>
      <!-- 以下3个div来回切换展示 -->
     <div v-show="scene == 0">
      <el-button type="primary" icon="el-icon-plus" @click="addSpu" :disabled="!category3Id">添加SPU</el-button>
      <el-table
      :data="records"
         style="width: 100%">
         <el-table-column
            align="center"
            type="index"
            label="序号"
            width="80px">
         </el-table-column>
         <el-table-column
            prop="spuName"
            label="SPU名称"
            width="width">
         </el-table-column>
         <el-table-column
            prop="description"
            label="SPU描述"
            width="width">
         </el-table-column>
         <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
               <!-- HintButton -->
               <hint-button type="success" icon="el-icon-plus" size="mini" title="添加sku" @click="addSku(row)"></hint-button>
               <hint-button type="warning" icon="el-icon-edit" size="mini" @click="updateSpu(row)" title="修改spu"></hint-button>
               <hint-button type="info" icon="el-icon-info" size="mini" title="查看当前spu全部sku列表" @click="handlerDialog(row)"></hint-button> 
               <el-popconfirm title="这是一段内容确定删除吗？" @onConfirm="deleteSpu(row)">
                   <hint-button type="danger" icon="el-icon-delete" size="mini" title="删除spu"  slot="reference"></hint-button>
               </el-popconfirm>
            </template>
         </el-table-column>
      </el-table>
      <el-pagination
             style="text-align:center"
            :current-page="page"
            :page-sizes="[3, 5, 10]"
            :page-size="limit"
            @current-change="getSpuList"
            @size-change="handleSizeChange"
             layout="prev, pager, next, jumper,->,total, sizes"
            :total="23">
      </el-pagination>
     </div>
      <SpuForm v-show="scene == 1" @changeScene=changeScene ref="spu"></SpuForm>
      <SkuForm v-show="scene == 2" ref="sku" @changeScenes=changeScenes></SkuForm>
   </el-card>
   <!-- 展示sku列表 -->
   <el-dialog :title="`${spu.spuName}的sku列表`" :visible.sync="dialogTableVisible" :before-close="beforeClose">
      <el-table :data="skuList" style="width: 100%"  v-loading="loading">
         <el-table-column prop="skuName" label="名称" width="width"></el-table-column>
         <el-table-column prop="price" label="价格" width="width"></el-table-column>
         <el-table-column prop="weight" label="重量" width="width"></el-table-column>
         <el-table-column prop="prop" label="默认图片" width="width">
            <template slot-scope="{row,$index}">
               <img :src="row.skuDefaultImg" style="width:100px;height:100px">
            </template>
         </el-table-column>
      </el-table>
   </el-dialog>
   </div>
</template>

<script>
// 引入子组件
import SpuForm from './SpuForm'
import SkuForm from './SkuForm'
 export default {
   data() {
      return {
         loading:true,//加载效果
         skuList:[],//sku列表数据
         //存储spu
         spu:{},
         // 查看sku列表对话框显示与隐藏
         dialogTableVisible:false,
         category1Id:'',
         category2Id:'',
         category3Id:'',
         //三级联动展示与隐藏
         show:true,
         page:1,
         limit:3,
         //SPU数据
         records:[],
         //分页器一页几条数据
         total:0,
         scene:0, //0代表SPU列表 1代表添加或修改SPU 2代表添加SKU
      }
   },
   components:{
      SpuForm,
      SkuForm
   },
    name:'Spu',
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
        this.getSpuList();
      }
    },
    //获取SPU列表数据进行展示
    async getSpuList(pager = 1){
      this.page = pager
      const {page,limit,category3Id} = this;
      let result = await this.$API.spu.reqSpuList(page,limit,category3Id)
      if(result.code == 200){
         this.records = result.data.records
         this.total = result.total
      }
    },
    //控制一页展示多少条数据回调
    handleSizeChange(limit){
        this.limit = limit
        this.getSpuList()
    },
    //添加SPU
    addSpu(){
      this.scene = 1
      // 通知子组件SpuForm发请求
      this.$refs.spu.addSpuData(this.category3Id);
    },
    //修改Spu
    updateSpu(row){
      this.scene = 1
      // 获取子组件发请求
      this.$refs.spu.initSpuData(row)
    },
    //SpuForm自定义事件（取消的场景切换）
    changeScene({scene,flag}){
      // flag用于区分保存按钮是添加还是修改
       this.scene = scene
       if(flag=='修改'){
          this.getSpuList(this.page)
       }else{
         this.getSpuList()
       }
       
    },
   //  删除spu
   async deleteSpu(row){
      let result = await this.$API.spu.reqDeleteSpu(row.id)
      if(result.code == 200){
         this.$message({type:'success',message:'删除成功'})
         this.getSpuList(this.records.length>1?this.page:this.page-1)
      }
   },
   // 添加sku按钮
   addSku(row){
      // 切换场景
      this.scene = 2
      this.$refs.sku.getDate(this.category1Id,this.category2Id,row)
   },
   //skuform自定义事件回调（取消的场景切换）
   changeScenes(scene){
      this.scene = scene
   },
   // 查看sku列表对话框
   async handlerDialog(spu){
      this.dialogTableVisible = true
      this.spu = spu
      //发请求获取sku列表数据
      let result = await this.$API.spu.reqSkuList(spu.id)
      if(result.code == 200){
         this.skuList = result.data
         // 服务器数据回来后清空加载效果
         this.loading = false
      }
   },
   //对话框关闭之前回调
   beforeClose(done){
      //让loading变为true
      this.loading = true
      //清空skuList数据 =》 为了避免点击过快上次数据会显示
      this.skuList = []
      done()
   }
    },
 }
</script>
<style>

</style>