// 登录拦截
exports.loginIntercept = async (ctx, next) => {
  let user = ctx.session.user
  if (user) {
    await next()
  } else {
    ctx.body = {
      status: 10001,
      msg: '当前未登录',
      result: ''
    }
  }
}