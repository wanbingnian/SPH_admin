// 商品属性相关解接口
import request from '@/utils/request'

//获取一级分类数据接口 /admin/product/getCategory1 GET
export const reqCategory1List = () => request({url:'/admin/product/getCategory1',method:'get'})

//获取二级分类数据接口 /admin/product/getCategory2/{category1Id} GET
export const reqCategory2List = (category1Id) => request({url:`/admin/product/getCategory2/${category1Id}`,method:'get'})

//获取三级分类数据接口 /admin/product/getCategory3/{category2Id} GET
export const reqCategory3List = (category2Id) => request({url:`/admin/product/getCategory3/${category2Id}`,method:'get'})

//根据category3Id 获取品牌属性 /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}  GET
export const reqAttrList = (category1Id,category2Id,category3Id) => request({url:`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,method:'get'})

//添加属性与属性值接口 /admin/product/saveAttrInfo post
export const reqAddOrUpdateAttr = (data) => request({url:'/admin/product/saveAttrInfo',method:'post',data})
/* 
  {
  "attrName": "string", //属性名
  "attrValueList": [    //属性名中的属性值 为多个所以是数组
    {
      "attrId": 0,
      "valueName": "string"
    }
  ],
  "categoryId": 0,    category3Id
  "categoryLevel": 3,
}
*/