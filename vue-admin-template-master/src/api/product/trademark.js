//品牌管理接口---获取品牌管理相关模块

//引入request
import request from '@/utils/request'
//获取品牌列表接口---/admin/product/baseTrademark/{page}/{limit} get
export const reqTradeMarkList = (page,limit) => request({url:`/admin/product/baseTrademark/${page}/${limit}`,method:'get'})

//添加品牌接口 /admin/product/baseTrademark/save  post   携带两参数  imgUrl tmName

//修改品牌 /admin/product/baseTrademark/update  put     携带三参数  id imgUrl tmName 
export const reqAddOrUpdateTradeMark = (tradeMark) => {
    // 如果携带id就是put请求 就是修改
    if(tradeMark.id){
      return request({url:'/admin/product/baseTrademark/update',method:'put',data:tradeMark})
    }else{
        return request({url:'/admin/product/baseTrademark/save',method:'post',data:tradeMark})
    }
}

//删除品牌 /admin/product/baseTrademark/remove/{id}  delete
export const reqDeleteTradeMark = (id) => request({url:`/admin/product/baseTrademark/remove/${id}`,method:'delete'})
