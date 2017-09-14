const router = require('koa-router')()
const Users = require('../models/Users')
const middleware = require('./middleware')
require('../util/util')

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

router.get('/getCartCount', async (ctx, next) => {
  let userName = ctx.session.user.userName
  try {
    let user = await Users.findByName(userName)
    let cartCount = 0
    user.cartList.map(item => {
      cartCount += parseInt(item.productNum)
    })

    ctx.body = {
      status: 0,
      msg: '',
      result: cartCount
    }

  } catch (err) {
    ctx.body = {
      status: 1,
      msg: err.message,
      result: ''
    }
  }
})

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

// 查询用户地址
router.get('/addressList', async (ctx, next) => {
  let userName = ctx.session.user.userName
  try {
    let user = await Users.findByName(userName)
    ctx.body = {
      status: 0,
      msg: '',
      result: {
        list: user.addressList
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

router.post('/address/setDefault', async (ctx, next) => {
  let userName = ctx.session.user.userName
  let addressId = ctx.request.body.addressId

  let json = {
    status: 0,
    msg: '',
    result: ''
  }

  if (!addressId) {
    json.status = 1003
    json.msg = 'addressId is null'
  }

  try {
    let user = await Users.findByName(userName)
    user.addressList.forEach((item, index) => {
      if (item.addressId === addressId) {
        item.isDefault = true
      } else {
        item.isDefault = false
      }
    })

    await user.save()

  } catch (err) {
    json.status = 1
    json.msg = err.message
  }

  ctx.body = json
})

router.post('/address/delete', async (ctx, next) => {
  let userName = ctx.session.user.userName
  let addressId = ctx.request.body.addressId

  let json = {
    status: 0,
    msg: '',
    result: ''
  }
  try {
    let user = await Users.delAddress(userName, addressId)
  } catch (err) {
    json.status = 1
    json.msg = err.message
  }

  ctx.body = json
})

router.post('/payMent', async (ctx, next) => {
  let userName = ctx.session.user.userName
  let orderTotal = ctx.request.body.orderTotal
  let addressId = ctx.request.body.addressId

  try {
    let user = await Users.findByName(userName)
    let addressInfo;
    let goodsList = [];
    // 获取当前用户的地址信息
    user.addressList.forEach(item => {
      if (item.addressId === addressId) {
        addressInfo = item
      }
    })

    if (!addressInfo) {
      ctx.body = {
        status: 10002,
        msg: '收货地址信息有误',
        result: ''
      }
      return
    }

    // 获取用户购物车的购买商品
    user.cartList.filter(item => {
      if (item.checked === '1') {
        goodsList.push(item)
      }
    })

    let platform = '622';
    let r1 = Math.floor(Math.random() * 10)
    let r2 = Math.floor(Math.random() * 10)
    let sysDate = new Date().Format('yyyyMMddhhmmss')
    let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')

    let orderId = platform + r1 + sysDate + r2

    let order = {
      orderId,
      orderTotal,
      addressInfo,
      goodsList,
      orderStatus: 1,
      createDate
    }

    user.orderList.push(order)
    await user.save()

    ctx.body = {
      status: 0,
      msg: '',
      result: {
        orderId: order.orderId,
        orderTotal: order.orderTotal
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

// 根据订单id查询订单信息
router.post('/orderDetail', async (ctx, next) => {
  let userName = ctx.session.user.userName
  let orderId = ctx.request.body.orderId

  try {
    let user = await Users.findByName(userName)

    let orderTotal;
    user.orderList.forEach(item => {
      if (item.orderId === orderId) {
        orderTotal = item.orderTotal
      }
    })

    if (!orderTotal) {
      ctx.body = {
        status: 1003,
        msg: '订单号不存在',
        result: ''
      }
    } else {
      ctx.body = {
        status: 0,
        msg: '',
        result: orderTotal
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

module.exports = router
