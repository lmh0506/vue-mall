const router = require('koa-router')()
const Users = require('../models/Users')
const middleware = require('./middleware')

router.prefix('/users')

// 登录
router.post('/login', async (ctx, next) => {
  let userName = ctx.request.body.userName
  let userPwd = ctx.request.body.userPwd
  try {
    const user = await Users.findByName(userName)
    let json = {
      status: 0,
      msg: ''
    }
    if (user) {
      if (user.userPwd != userPwd) {
        json.msg = '密码错误'
      } else {
        json.result = userName
        ctx.session.user = {userName, userPwd}
      }
    } else {
      json.msg = '用户名不存在'
    }
    ctx.body = json
  } catch (err) {
    ctx.body = {
      status: 1,
      msg: err.message
    }
  }
})

// 登出
router.post('/logout', async (ctx, next) => {
  ctx.session.user = null
  ctx.body = {
    status: 0,
    msg: '',
    result: 'success'
  }
})

router.get('/checkLogin', async (ctx, next) => {
  if (ctx.session.user) {
    ctx.body = {
      status: 0,
      msg: '',
      result: ctx.session.user
    }
  } else {
    ctx.body = {
      status: 1,
      msg: '未登录',
      result: ''
    }
  }
})

router.use(middleware.loginIntercept)

// 查询当前用户的购物车数据
router.get('/cartList', async (ctx, next) => {
  let userName = ctx.session.user.userName
  try {
    const user = await Users.findByName(userName)
    ctx.body = {
      status: 0,
      msg: '',
      result: {
        list: user._doc.cartList
      }
    }
  } catch (err) {
    ctx.body = {
      status: 1,
      msg: err.message,
      result: ''
    }
  }
})

router.post('/cart/del', async (ctx, next) => {
  let userName = ctx.session.user.userName
  let productId = ctx.request.body.productId
  try {
    await Users.delCart(userName, productId)

    ctx.body = {
      status: 0,
      msg: '',
      result: ''
    }
  } catch (err) {
    ctx.body = {
      status: 1,
      msg: err.message,
      result: ''
    }
  }
})

router.post('/cart/update', async (ctx, next) => {
  let userName = ctx.session.user.userName
  let productItem = ctx.request.body
  let json = {
    status: 0,
    msg: '',
    result: ''
  }

  try {
    await Users.updateCart(userName, productItem)
  } catch (err) {
    json.status = 1
    json.msg = err.message
  }

  ctx.body = json
})

router.post('/cart/checkAll', async (ctx, next) => {
  let userName = ctx.session.user.userName
  let checkAll = ctx.request.body.checkAll | 0
  let json = {
    status: 0,
    msg: '',
    result: ''
  }

  try {
    let user = await Users.findByName(userName)
    user.cartList.forEach(item => {
      item.checked = checkAll 
    })
    await user.save()
  } catch (err) {
    json.status = 1
    json.msg = err.message
  }

  ctx.body = json
})

module.exports = router
