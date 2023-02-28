<template>
  <div>
    <el-form label-width="80px">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="label">
        <el-select placeholder="请选择品牌" v-model="spu.tmId">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="(tm, index) in tradeMarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          rows="4"
          placeholder="SPU描述"
          v-model="spu.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :file-list="spuImageList"
          :on-success="handlerSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select :placeholder="`还有${unselectSaleAttr.length}未选择`" v-model="attrIdAndAttr">
          <el-option :label="unselect.name" :value="`${unselect.id}:${unselect.name}`" v-for="(unselect, index) in unselectSaleAttr" :key="unselect.id"></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" :disabled="!attrIdAndAttr" @click="addSaleAttr">添加销售属性</el-button>
        <el-table style="width: 100%" :data="spu.spuSaleAttrList">
          <el-table-column
            type="index"
            label="序号"
            width="80px"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="saleAttrName"
            label="属性名"
            width="width"
          ></el-table-column>
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag :key="tag.id" v-for="(tag,index) in row.spuSaleAttrValueList" closable :disable-transitions="false" @close="row.spuSaleAttrValueList.splice(index,1)">{{ tag.saleAttrValueName }}</el-tag>
              <!-- @keyup.enter.native="handleInputConfirm"
                @blur="handleInputConfirm" -->
              <el-input class="input-new-tag"  v-if="row.inputVisible" v-model="row.inputValue" ref="saveTagInput"  size="small" @blur="handleInputConfirm(row)"></el-input>
              <!-- @click="showInput" -->
              <el-button v-else class="button-new-tag" size="small" @click="addSaleAttrValue(row)">添加</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="spu.spuSaleAttrList.splice($index,1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      //存储spu信息
      spu: {
        // 三级分类ID
        category3Id: 0,
        // 描述
        description: "",
        //品牌的id
        tmId: '',
        // spu名称
        spuName: "",
        // spu图片信息
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        // 平台售卖属性
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          //     {
          //       baseSaleAttrId: 0,
          //       id: 0,
          //       isChecked: "string",
          //       saleAttrName: "string",
          //       saleAttrValueName: "string",
          //       spuId: 0,
          //     },
          //   ],
          // },
        ],
      },
      // 存储品牌信息
      tradeMarkList: [],
      // 存储spu图标
      spuImageList: [],
      // 存储销售属性
      saleAttrList: [],
      // 未选择的销售属属性id
      attrIdAndAttr:''
    };
  },
  methods: {
    // 照片墙删除某一张图片时调用
    handleRemove(file, fileList) {
      // file:代表要删除的那个图片
      // fileList：照片墙删除某一张图片后剩余的其余图片
      // console.log(file, fileList);
      this.spuImageList = fileList
    },
    // 照片墙数据预览的回调
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //初始化SpuForm数据（发请求）(点击修改时执行)
    async initSpuData(spu) {
      //发请求获取spu数据
      // 获取spu信息
      let spuResult = await this.$API.spu.reqSpu(spu.id);
      if (spuResult.code == 200) {
        this.spu = spuResult.data;
      }
      //获取品牌信息
      let tradeMarkListResult = await this.$API.spu.reqTrademark();
      if (tradeMarkListResult.code == 200) {
        this.tradeMarkList = tradeMarkListResult.data;
      }
      // 获取spu图标
      let spuImageListResult = await this.$API.spu.reqSpuImageList(spu.id);
      if (spuImageListResult.code == 200) {
        // this.spuImageList = spuImageListResult.data;
        // 由于照片墙显示数据需要数组，数组内要有name和url字段
        let listArr = spuImageListResult.data;
        listArr.forEach((element) => {
          element.name = element.imgName;
          element.url = element.imgUrl;
        });
        this.spuImageList = listArr;
      }
      // 获取平台全部销售属性
      let saleAttrListResult = await this.$API.spu.reqSaleAttrList();
      if (saleAttrListResult.code == 200) {
        this.saleAttrList = saleAttrListResult.data;
      }
    },
    //照片墙添加图片成功回调
    handlerSuccess(response,file,fileList){
       this.spuImageList = fileList
    },
    //添加销售属性
    addSaleAttr(){
      const [baseSaleAttrId,saleAttrName] = this.attrIdAndAttr.split(':')
      let newSaleAttr = {baseSaleAttrId,saleAttrName,spuSaleAttrValueList:[]}
      this.spu.spuSaleAttrList.push(newSaleAttr)
      this.attrIdAndAttr = ''
    },
    //添加按钮回调
    addSaleAttrValue(row){
       //点击添加按钮 由button转为input
      //  响应式数据！！！
       this.$set(row,'inputVisible',true)
      // 响应式收集新增的销售属性值到inputValue
      this.$set(row,'inputValue','')
    },
    // ei-input失去焦点事件
    handleInputConfirm(row){
      //解构row并收集数据
      const {baseSaleAttrId,inputValue} = row;
      if(inputValue.trim() == ''){
        this.$message('属性值不能为空')
        return
      }
      let result = row.spuSaleAttrValueList.every(item=>item.saleAttrValueName!=inputValue)
      console.log(result);
      if(!result) return
      let newSaleAttrValue = {baseSaleAttrId,saleAttrValueName:inputValue}
      row.spuSaleAttrValueList.push(newSaleAttrValue)
      row.inputVisible = false
    },
    // 保存按钮回调
    async addOrUpdateSpu(){
      //整理参数--需要整理照片墙的数据
      // 图片携带参数imageUrl和imageName字段
      this.spu.spuImageList = this.spuImageList.map(item=>{
        return {
           imageName:item.name,
           imageUrl:(item.response&&item.response.data)||item.url,
        }
      })
      // 发请求
      let result = await this.$API.spu.reqAddOrUpdateSpu(this.spu)
     if(result.code == 200){
       this.$message({type:'success',message:'保存成功'})
       this.$emit('changeScene', {scene:0,flag:this.spu.id?'修改':'添加'})
     }
    //  清除数据
    Object.assign(this._data,this.$options.data())
    },
    //点击添加按钮执行
    async addSpuData(category3Id){
     // 添加spu时手机三级分类id
     this.spu.category3Id = category3Id;
    //获取品牌信息
      let tradeMarkListResult = await this.$API.spu.reqTrademark();
      if (tradeMarkListResult.code == 200) {
        this.tradeMarkList = tradeMarkListResult.data;
      }
      // 获取平台全部销售属性
      let saleAttrListResult = await this.$API.spu.reqSaleAttrList();
      if (saleAttrListResult.code == 200) {
        this.saleAttrList = saleAttrListResult.data;
      }
    },
    // 取消按钮
    cancel(){
      this.$emit('changeScene', {scene:0,flag:''})
      //清除数据
      //Object.assign:es6新增的方法可以合并对象
      // 组件实例this._data,可以操作data中响应式数据
      // this.$options这个可以获取配置对象，配置对象的data（）函数执行，返回的响应式数据为空
      Object.assign(this._data,this.$options.data())
    }
  },
  computed:{
    unselectSaleAttr(){
      let result = this.saleAttrList.filter(item=>{
        return this.spu.spuSaleAttrList.every(item1=>{
          return item.name != item1.saleAttrName
        })
      })
      return result
    }
  }
};
</script>

<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>