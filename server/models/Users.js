const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userId: String,
  userName: String,
  userPwd: String,
  orderList: Array,
  cartList: [{
    productId: String,
    productName: String,
    salePrice: String,
    productImage: String,
    checked: String,
    productNum: String
  }],
  addressList: [{
    addressId : String,
    userName : String,
    streetName : String,
    postCode : String,
    tel : String,
    isDefault : Boolean
  }]
})

userSchema.statics = {
  findById (userId) {
    return this.findOne({userId}).exec()
  },
  findByName (userName) {
    return this.findOne({userName}).exec()
  },
  delCart (userName, productId) {
    return this.update(
      {userName}, 
      {
        $pull: {
          'cartList': {
            productId
          }
        }
      })
      .exec()
  },
  updateCart (userName, productItem) {
    return this.update({
      userName, 
      'cartList.productId': productItem.productId
    },
    {
      'cartList.$.productNum': productItem.productNum,
      'cartList.$.checked': productItem.checked,
    })
    .exec()
  },
  delAddress (userName, addressId) {
    return this.update(
      {userName}, 
      {
        $pull: {
          'addressList': {
            addressId
          }
        }
      })
      .exec()
  }
}

module.exports = mongoose.model('User', userSchema)
