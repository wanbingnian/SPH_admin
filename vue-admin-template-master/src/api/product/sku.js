import request from '@/utils/request'
//获取sku列表
// /admin/product/list/{page}/{limit} get
export const reqSkuList = (page,limit) => request({url:`/admin/product/list/${page}/${limit}`,method:'get'})

// 上架商品 /admin/product/onSale/{skuId} get
export const reqonSale = (skuId) => request({url:`/admin/product/onSale/${skuId}`,method:'get'})

//下架商品  /admin/product/cancelSale/{skuId}  get
export const reqcanceSale = (skuId) => request({url:`/admin/product/cancelSale/${skuId}`,method:'get'})

 //获取sku详情  /admin/product/getSkuById/{skuId}  get
 export const reqSkuById = (skuId) => request({url:`/admin/product/getSkuById/${skuId}`,method:'get'})
