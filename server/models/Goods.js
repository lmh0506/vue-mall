const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const goodSchema = new Schema({
  'productId': String,
  'productName': String,
  'salePrice': Number,
  'productImage': String
})

goodSchema.statics = {
  findAll(params, page, sort) {
    const pageSize = 5
    const skip = (page - 1) * pageSize

    return this.find(params)
      .skip(skip)
      .limit(pageSize)
      .sort({'salePrice': sort})
      .exec()
  },
  findById(id) {
    return this.findOne({productId: id}).exec()
  }
}

module.exports = mongoose.model('Good', goodSchema)
