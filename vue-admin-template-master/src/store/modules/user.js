//引入登录|退出登录|获取用户信息的接口函数
import { login, logout, getInfo } from '@/api/user'
// 获取token|设置token|删除token函数
import { getToken, setToken, removeToken } from '@/utils/auth'
//路由模块当中重置路由的方法
//引入user.js中各路由
import router, { resetRouter,asyncRoutes, anyRoutes,constantRoutes} from '@/router'

//箭头函数
const getDefaultState = () => {
  return {
    // 获取token
    token: getToken(),
    // 存储用户名
    name: '',
    // 存储用户头像
    avatar: ''
  }
}

const state = getDefaultState()

// 唯一修改state的地方
const mutations = {
  // 重置state
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  // 存储token
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // 获取用户信息
 SET_USERINFO: (state,userInfo) =>{
      //存储用户名
      state.name = userInfo.name
      // 存储用户头像
      state.avatar = userInfo.avatar
      //存储菜单权限标记[根据不同用户返回标记信息，数组里边的元数是字符串]
      state.routes = userInfo.routes
      //存储按钮权限标记
      state.buttons = userInfo.buttons
      // 存储角色信息
      state.roles = userInfo.roles
      // 此处增加一个字段，用于对比已有的异步路由，与服务器返回的标记信息进行对比后，最后需要展示的路由
      resultAsyncRoutes:[]
      //用户最终需要展示的全部路由
      resultAllRoutes:[]
 },
 //最终计算出的异步路由
 SET_RESULTASYNCROUTES:(state,asyncRoutes)=>{
  // vuex保存当前异步路由，注意：一个用户需要展示的路由包括：常量，异步，任意路由
  state.resultAsyncRoutes = asyncRoutes
  // 合并计算出当前用户需要展示的所有路由
  state.resultAllRoutes = constantRoutes.concat(state.resultAsyncRoutes,anyRoutes)
  //给路由器添加新的路由
  router.addRoutes(state.resultAllRoutes)
 }
}


//定义一个函数：两个数组对比，对比出当前用户到底显示哪些异步路由
const computedAsyncRoutes = (asyncRoutes,routes) => {
    //过滤当前用户【超级管理|普通员工】需要展示的异步路由
    return asyncRoutes.filter(item=>{
      //数组中没有这个元素返回-1,
      if(routes.indexOf(item.name)!=-1){
        //递归
        if(item.children&&item.children.length){
          item.children = computedAsyncRoutes(item.children,routes)
        }
        return true
      }
    })
}

const actions = {
  //登录业务
    async login({ commit }, userInfo) {
    const { username, password } = userInfo
    let result = await login({ username: username.trim(), password: password })
    if(result.code == 20000){
      // vuex存储token
      commit('SET_TOKEN', result.data.token)
      // 持久化存储token
      setToken(result.data.token)
    }else{
      return Promise(new Error('faile'))
    }
    // return new Promise((resolve, reject) => {
    //   login({ username: username.trim(), password: password }).then(response => {
    //     const { data } = response
    //     commit('SET_TOKEN', data.token)
    //     setToken(data.token)
    //     resolve()
    //   }).catch(error => {
    //     reject(error)
    //   })
    // })
  },

  //获取用户信息
   getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        //获取用户信息：返回数据包括：用户名name，用户头像avatar，routes【返回标记：不同用户展示不同菜单的标记】，roles：用户角色信息，buttons：按钮权限信息
        const { data } = response
        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        // vuex存储用户全部的信息
        commit('SET_USERINFO',data)
        commit('SET_RESULTASYNCROUTES',computedAsyncRoutes(asyncRoutes,data.routes))//computedAsyncRoutes函数比较返回一个最终异步路由
        resolve(data)
      }).catch(error => {
        reject(error)
      }) 
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

