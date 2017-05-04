const fs = require('fs')
  , path = require('path')
  , moment = require('moment')
  , async = require('async')
  , discountModel = require(__dirname + '/../../../models/discount')
  , productModel = require(__dirname + '/../../../models/products')
  , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Comment routes class.
 * @constructor
 */

class DiscountApi {
  constructor() {
  };

  _getDefaultOptions() {
    return {
      params: {
        appId: 1,
        companyId: 49
      },
      data: {},
      headers: {}
    };
  };


  create(req, res, next) {
    const id = req.params.id;
    const discount = req.body.discount;
    const machineId = req.body.machineId;
    let basicOptions = this._getDefaultOptions();
    basicOptions.params.machineId = machineId;
    basicOptions.params.productReference = id;

    productModel.getProduct(basicOptions)
      .then((product) => {
        if (!discount || product.articlesTariffs_VO.price < discount) helperFunctions.generateResponse(422, 'Discount price should be less than regular price', null, null, res);
        return discountModel.list({product_id: id})
      })
      .then((product) => {
        const saveData = {
          product_id: id,
          discount: discount
        };
        if (!product.length) return discountModel.create(saveData);
        return discountModel.update({_id: product[0]._id}, saveData)
      })
      .then((saved) => {
        helperFunctions.generateResponse(200, null, {}, 'Product successfully updated.', res);
      })
      .catch(e => console.error(e));
  }

  getDiscount(req, res, next) {
    const id = req.params.id;
    discountModel.list({product_id: id})
      .then((discount) => {
        if(discount.length) return helperFunctions.generateResponse(200, null, {discount: discount[0]}, null, res);
        helperFunctions.generateResponse(200, null, {discount: null}, null, res);
      })
  }

  getDiscountList(req, res, next) {
    discountModel.list({})
      .then((discount) => {
        if(discount.length) return helperFunctions.generateResponse(200, null, {discounts: discount}, null, res);
        helperFunctions.generateResponse(200, null, {discount: null}, null, res);
      })
  }

}

const discountApi = new DiscountApi();

module.exports = discountApi;
