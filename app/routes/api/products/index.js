const fs = require('fs')
  , path = require('path')
  , productsModel = require(__dirname + '/../../../models/products')
  , spentFreeModel = require(__dirname + '/../../../models/spentFree')
  , existingProductsModel = require(__dirname + '/../../../models/products/existingProducts')
  , productCategoriesModel = require(__dirname + '/../../../models/products/productCategories')
  , orderModel = require(__dirname + '/../../../models/orders')
  , userModel = require(__dirname + '/../../../models/user')
  , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Comment routes class.
 * @constructor
 */

class ProductsRoutes {
  constructor() {
    this.ORDER_STATUSES = {
      pending: 'pending',
      booked: 'booked',
      paid: 'paid',
      error: 'error_booking'
    };
  };


  /**
   * Create default options for queries
   * @returns {Object} - return default query options
   */

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


  /**
   * Get product handler
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  getProductHandler(req, res, next) {
    let basicOptions = this._getDefaultOptions();
    basicOptions.params.machineId = req.params.machineId;
    basicOptions.params.productReference = req.params.productId;

    productsModel.getProduct(basicOptions)
      .then((currentProduct) => {
        helperFunctions.generateResponse(200, null, {product: currentProduct}, '', res);
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });
  }


  /**
   * Get products list handler
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  getProductListHandler(req, res, next) {
    let basicOptions = this._getDefaultOptions();
    productsModel.getProductsList(basicOptions)
      .then((products) => {
        helperFunctions.generateResponse(200, null, {products: products}, '', res);
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });
  }


  /**
   * Update new products handler
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  updateNewProductsHandler(req, res, next) {
    let options = req.body || {};
    let productId = req.body.productId.toString() || null;

    existingProductsModel.list({})
      .then((p) => {
        if (!p || !p.length) {
          return existingProductsModel.create({product_ids: [productId]});
        } else {
          if (!p[0].product_ids.includes(productId)) {
            return existingProductsModel.update({_id: p[0]._id}, {$addToSet: {product_ids: productId}});
          }
        }
      })
      .then((products) => {
        helperFunctions.generateResponse(200, null, {products: products}, '', res);
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });
  }


  /**
   * Product categories list handler
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  productCategoriesListHandler(req, res, next) {
    productCategoriesModel.list({})
      .then((products) => {
        helperFunctions.generateResponse(200, null, {categories: products}, '', res);
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });
  }


  /**
   * Product categories image updated handler
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  updateCategoryPictureHandler(req, res, next) {
    let categoryId = req.params.id || null;
    let filePath = req.file.path || null;
    if (!categoryId || !filePath) {
      helperFunctions.generateResponse(422, 'Wrong incoming params', null, null, res);
      return;
    }
    filePath = filePath.replace('public/', config.get('serverUrl'));

      productCategoriesModel.list({category_id : categoryId})
          .then((category) => {
            if(!category.length) return productCategoriesModel.create({category_id : categoryId, photo : filePath})
            return productCategoriesModel.update({category_id: categoryId}, {photo: filePath});
      })
      .then((category) => {
        helperFunctions.generateResponse(200, null, {category: category}, '', res);
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });
  }


  /**
   * Create order handler
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  createOrderHandler(req, res, next) {
    const machineId = req.params.machineId || null;
    const productIds = req.body.productIds || [];
    const paymentMethod = req.body.paymentMethod || 'payment';
    const currentUser = req.user;
    const cardId = req.body.cardId;


    if (!productIds.length || !machineId) {
      helperFunctions.generateResponse(422, 'Wrong incoming params', null, null, res);
      return;
    }

    orderModel.processNewOrder(productIds, machineId, paymentMethod, currentUser, cardId)
      .then((r) => {
        helperFunctions.generateResponse(200, null, {r: r}, '', res);
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });

  }


  /**
   * Get order status handler
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  getOrderStatusHandler(req, res, next) {
    let basicOptions = this._getDefaultOptions();
    let orderId = req.params.orderId || null;
    let machineId = req.params.machineId || null;

    if (!orderId || !machineId) {
      helperFunctions.generateResponse(422, 'Wrong incoming params', null, null, res);
      return;
    }

    basicOptions.params.orderId = itemId;
    basicOptions.params.machineId = machineId;

    productsModel.getOrderStatus(basicOptions)
      .then((order) => {
        helperFunctions.generateResponse(200, null, {result: order}, '', res);
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });

  }


  /**
   * Cancel order handler
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  cancelOrderHandler(req, res, next) {
    let basicOptions = this._getDefaultOptions();
    let orderId = req.params.orderId || null;
    let machineId = req.params.machineId || null;
    let user = req.user;

    if (!orderId || !machineId) {
      helperFunctions.generateResponse(422, 'Wrong incoming params', null, null, res);
      return;
    }

    basicOptions.params.orderId = orderId;
    basicOptions.params.machineId = machineId;

    orderModel.cancelOrder(basicOptions, user)
      .then((order) => {
        helperFunctions.generateResponse(200, null, {result: order}, 'Successfully canceled order.', res);
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });

  }


  /**
   * Update order status
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  updateOrderHandler(req, res, next) {
    let orderId = req.params.orderId || null;
    let machineId = req.params.machineId || null;
    let bodyParams = req.body || {};
    console.log(bodyParams)

    if (!orderId || !machineId) {
      helperFunctions.generateResponse(422, 'Wrong order id', null, null, res);
      return;
    }
    orderModel.list({_id: orderId})
      .then((orders) => {
      let order = orders[0];
        userModel.getUser({_id: order.user_id})
          .then((users) => {
            let user = users[0];
            spentFreeModel.list({})
              .then((spent) => {
                const price = spent[0].price;
                if(price == 0) return Promise.resolve('OK');
                let newPrice = +user.spent_money.toFixed(2) + (+order.price);
                console.log(newPrice)
                if (newPrice >= price) {
                  const freeProductCount = Math.floor(newPrice/price);
                  for (let i = 0; i < freeProductCount; i++) {
                    user.freeProducts.push("2");
                  }
                  user.spent_money = (newPrice - price * freeProductCount).toFixed(2);
                } else {
                  user.spent_money = newPrice;
                }
                return userModel.updateUser({_id : user._id}, {spent_money:user.spent_money, freeProducts :user.freeProducts})
              })
              .then(() => {
                orderModel.update({_id: orderId}, bodyParams)
                  .then((order) => {
                    helperFunctions.generateResponse(200, null, {result: order}, 'Successfully updated.', res);
                  })
              })
              .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
              });
          })
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });


  }


  /**
   * Get orders list
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next - next route
   */

  ordersListHandler(req, res, next) {
    let currentUser = req.user;
    orderModel.list({user_id: currentUser._id})
      .then((orders) => {
        helperFunctions.generateResponse(200, null, {orders: orders}, '', res);
      })
      .catch((err) => {
        console.log(err);
        helperFunctions.generateResponse(422, err, null, null, res);
      });

  }

}

const productsRoutes = new ProductsRoutes();

module.exports = productsRoutes;
