const router = require('koa-router')()
const Goods = require('../models/Goods')
const Users = require('../models/Users')
const middleware = require('./middleware')

router.prefix('/goods')

// 查询商品列表数据
router.get('/', async (ctx, next) => {
  let page = ctx.query.page || 1
  let sort = ctx.query.sort || 1
  let priceLevel = ctx.query.priceLevel

  var priceGt = ''
  var priceLte = ''
  var params = {}
  if(priceLevel != 'all') {
    switch(priceLevel) {
      case '0': priceGt = 0; priceLte = 100; break;
      case '1': priceGt = 100; priceLte = 500; break;
      case '2': priceGt = 500; priceLte = 1000; break;
      case '3': priceGt = 1000; priceLte = 2000; break;
    }

    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }

  try{
    let goods = await Goods.findAll(params, page, sort)
    ctx.body = {
      status: 0,
      msg: '',
      result: {
        count: goods.length,
        list: goods
      }
    }
  } catch(err) {
    ctx.body = {
      status: 1,
      msg: err.message
    }
  }
})

router.use(middleware.loginIntercept)

// 加入到购物车
router.post('/addCart', async (ctx, next) => {
  const userId = '100000077'
  const productId = ctx.request.body.productId
  try{
    let good = '';
    const user = await Users.findById(userId)
    user.cartList.forEach(item => {
      if (item.productId === productId) {
        good = item;
        item.productNum ++
      }
    });
    // 如果购物车中没有 则初始化商品的购买数量和选中状态 如何添加到购物车中
    if (good === '') {
      good = await Goods.findById(productId)
      good._doc.productNum = 1
      good._doc.checked = 1
      user.cartList.push(good)
    }
    await user.save()

    ctx.body = {
      status: 0,
      msg: '',
      result: 'success'
    }
  } catch (err) {
    ctx.body = {
      status: 1,
      msg: err.message
    }
  }
})

module.exports = router
