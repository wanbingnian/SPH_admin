<template>
  <div>
    <el-form ref="form" label-width="80px">
      <el-form-item label="SPU名称"> {{spu.spuName}} </el-form-item>
      <el-form-item label="价格(元)">
        <el-input placeholder="价格(元)" v-model="skuInfo.price"></el-input>
      </el-form-item>
      <el-form-item label="质量(千克)">
        <el-input placeholder="质量(千克)" v-model="skuInfo.weight" type="number"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input placeholder="规格描述" type="textarea" rows="4" v-model="skuInfo.skuDesc"></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" ref="form" label-width="80px">
          <el-form-item :label="attr.attrName" v-for="(attr,index) in attrInfoList" :key="attr.id">
            <el-select placeholder="请选择" v-model="attr.attrIdAndvalueId">
              <el-option :label="attrValue.valueName" :value="`${attr.id}:${attrValue.id}`" v-for="(attrValue,index) in attr.attrValueList" :key="attrValue.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form :inline="true" ref="form" label-width="80px">
          <el-form-item :label="saleAttr.saleAttrName" v-for="(saleAttr,index) in saleAttrList" :key="saleAttr.id">
            <el-select placeholder="请选择" v-model="saleAttr.saleAttrIdAndvalueId">
              <el-option :label="saleAttrValue.saleAttrValueName" :value="`${saleAttr.id}:${saleAttrValue.id}`" v-for="(saleAttrValue,index) in saleAttr.spuSaleAttrValueList" :key="saleAttrValue.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table style="width: 100%" :data="spuImageList" border @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            prop="prop"
            width="80"
          >
          </el-table-column>
          <el-table-column prop="prop" label="图片" width="width">
            <template slot-scope="{row,$index}">
               <img :src="row.imgUrl" style="width:100px;height:100px">
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
               <el-button type="primary" v-if="row.isDefault == 0" @click="changeDefault(row)">设置默认</el-button>
               <el-button v-else>默认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      spuImageList: [], //存储图片信息数据
      saleAttrList: [], //存储销售属性数据
      attrInfoList: [], //存储平台属性数据
      spu:{},
      imageList:[],//收集图片数据
      // sku的数据
      skuInfo: {
        // 第一类收集的数据：父组件给的数据
        category3Id: 0,
        spuId: 0,
        tmId: 0,
        // 第二类：通过数据双向绑定v-model获取数据
        price: '',
        skuName: "",
        skuDesc: "",
        weight: "",

        skuAttrValueList: [
         //  {
         //    attrId: 0,
         //    valueId: 0,
         //  },
        ],
        skuDefaultImg: "",
        
        skuImageList: [
         //  {
         //    imgName: "string",
         //    imgUrl: "string",
         //    isDefault: "string",
         //    spuImgId: 0,
         //  },
        ],
        
        skuSaleAttrValueList: [
         //  {
         //    id: 0,
         //    saleAttrId: 0,
         //    saleAttrName: "string",
         //    saleAttrValueId: 0,
         //    saleAttrValueName: "string",
         //    skuId: 0,
         //    spuId: 0,
         //  },
        ],
        
        
      },
    };
  },
  methods: {
    // 获取skuform信息
    async getDate(category1Id, category2Id, spu) {
      // 收集父组件给予的数据
      this.skuInfo.category3Id = spu.category3Id
      this.skuInfo.spuId = spu.id
      this.skuInfo.tmId = spu.tmId
      this.spu = spu
      let result1 = await this.$API.spu.reqSpuImageList2(spu.id);
      if (result1.code == 200) {
        let list = result1.data;
        list.forEach(item=>{
          item.isDefault = 0
        })
        this.spuImageList = list
      }
      let result2 = await this.$API.spu.reqSaleAttrList2(spu.id);
      if (result2.code == 200) {
        this.saleAttrList = result2.data;
      }
      let result3 = await this.$API.spu.reqAttrInfoList(
        category1Id,
        category2Id,
        spu.category3Id
      );
      if (result3.code == 200) {
        this.attrInfoList = result3.data;
      }
    },
    // table复选框事件
    handleSelectionChange(params){
       //获取用户选中图片的信息，但是注意带给服务器少了isDefault字段
       this.imageList = params
    },
    // 排他操作，设置默认图片
    changeDefault(row){
      this.spuImageList.forEach(item => {
        item.isDefault = 0
      })
      row.isDefault = 1
      this.skuInfo.skuDefaultImg = row.imgUrl
    },
    // 取消按钮回调
    cancel(){
      this.$emit('changeScenes',0)
      // 清除数据
      Object.assign(this._data,this.$options.data())
    },
    //保存按钮回调
    async save(){
      //整理参数
      //整理平台属性的数据
      const {attrInfoList,skuInfo,saleAttrList,imageList} = this;
      skuInfo.skuAttrValueList = attrInfoList.reduce((prev,item)=>{
         if(item.attrIdAndvalueId){
             const [attrId,valueId] = item.attrIdAndvalueId.split(':')
             prev.push({attrId,valueId})
         } 
         return prev
      },[])
      // 整理销售属性
      skuInfo.skuSaleAttrValueList = saleAttrList.reduce((prev,item)=>{
        if(item.saleAttrIdAndvalueId){
           const [saleAttrId,saleAttrValueId] = item.saleAttrIdAndvalueId.split(':')
           prev.push({saleAttrId,saleAttrValueId})
        }
        return prev
      },[])
      // 整理图片信息
      skuInfo.skuImageList = imageList.map(item=>{
        return{
          imgName:item.imgUrl,
          imgUrl:item.imgUrl,
          isDefault:item.isDefault,
          spuImgId:item.id,
        }
      })
      //发请求
      let result = await this.$API.spu.reqAddSku(skuInfo)
       if(result.code == 200){
         this.$message('添加sku成功')
          this.$emit('changeScenes',0)
       }
    },
    
  },
};
</script>

<style>
</style>