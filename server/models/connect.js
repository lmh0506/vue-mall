const mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/vue-mall')

mongoose.connection.on('connected', () => {
  console.log('连接成功');
})

mongoose.connection.on('error', () => {
  console.log('连接失败');
})

mongoose.connection.on('dis', () => {
  console.log('连接断开');
})
