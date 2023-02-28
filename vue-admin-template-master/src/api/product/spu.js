import request from '@/utils/request'

//获取SPU列表数据接口 /admin/product/{page}/{limit} GET
export const reqSpuList = (page,limit,category3Id) => request({url:`/admin/product/${page}/${limit}`,params:{category3Id},method:'get'})

// 获取spu信息 /admin/product/getSpuById/{spuId} GET
export const reqSpu = (spuId) => request({url:`/admin/product/getSpuById/${spuId}`,method:'get'})

// 获取品牌信息 /admin/product/baseTrademark/getTrademarkList GET
export const reqTrademark = () => request({url:'/admin/product/baseTrademark/getTrademarkList',method:'get'})

// 获取spu图标 /admin/product/spuImageList/{spuId} GET
export const reqSpuImageList = (spuId) => request({url:`/admin/product/spuImageList/${spuId}`,method:'get'})

//获取平台全部销售属性 /admin/product/baseSaleAttrList GET
export const reqSaleAttrList = () => request({url:'/admin/product/baseSaleAttrList',method:'get'})

// 修改||添加spu 携带参数基本一致 唯一区别就是修改携带id
export const reqAddOrUpdateSpu = (spuInfo) =>{
    if(spuInfo.id){
        return request({url:'/admin/product/updateSpuInfo',method:'post',data:spuInfo})
    }else{
        return request({url:'/admin/product/saveSpuInfo',method:'post',data:spuInfo})
    }
}
// 删除spu   /admin/product/deleteSpu/{spuId}  delete
export const reqDeleteSpu = (spuId) => request({url:`/admin/product/deleteSpu/${spuId}`,method:'delete'})


// 获取图片信息 /admin/product/spuImageList/{spuId} get
export const reqSpuImageList2 = (spuId) => request({url:`/admin/product/spuImageList/${spuId}`,method:'get'})

// 获取销售属性信息 /admin/product/spuSaleAttrList/{spuId} get
export const reqSaleAttrList2 = (spuId) => request({url:`/admin/product/spuSaleAttrList/${spuId}`,method:'get'})

// 获取平台属性 /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id} get
export const reqAttrInfoList = (category1Id,category2Id,category3Id) => request({
    url:`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
    method:'get'
})

//添加sku（保存） /admin/product/saveSkuInfo post
export const reqAddSku = (skuInfo) => request({url:'/admin/product/saveSkuInfo',method:'post',data:skuInfo})

//获取sku列表数据  /admin/product/findBySpuId/{spuId}  get
export const reqSkuList = (spuId) => request({url:`/admin/product/findBySpuId/${spuId}`,method:'get'})
