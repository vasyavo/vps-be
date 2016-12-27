const fs = require('fs')
    , path = require('path')
    , productsModel = require(__dirname + '/../../../models/products')
    , existingProductsModel = require(__dirname + '/../../../models/products/existingProducts')
    , productCategoriesModel = require(__dirname + '/../../../models/products/productCategories')
    , orderModel = require(__dirname + '/../../../models/orders')
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
        basicOptions.params.productId = req.params.productId;

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
                        return existingProductsModel.update({_id: p[0]._id}, { $addToSet: {product_ids: productId } });
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

        productCategoriesModel.update({_id: categoryId}, {photo: filePath})
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
        let basicOptions = this._getDefaultOptions();
        let itemId = req.params.itemId || null;
        let machineId = req.params.machineId || null;

        if (!itemId || !machineId) {
            helperFunctions.generateResponse(422, 'Wrong incoming params', null, null, res);
            return;
        }
        let preparedOrder = {};

        basicOptions.params.machineId = machineId;
        basicOptions.params.productId = itemId;

        productsModel.getProduct(basicOptions)
            .then((currentProduct) => {
                return currentProduct;
            })
            .then((currentProduct) => {
                let orderObjcet = {
                    item_id: currentProduct.id,
                    user_id: req.user._id,
                    machine_id: machineId,
                    status: this.ORDER_STATUSES.pending,
                    products: [
                        {
                            productId: currentProduct.productId,
                            productReference: currentProduct.productReference,
                            productQuantity: '1',
                            productPriceUnit: currentProduct.price
                        }
                    ]
                };
                return orderModel.create(orderObjcet);
            })
            .then((savedOrder) => {
                preparedOrder = {
                    id: savedOrder._id,
                    machineId: savedOrder.machine_id,
                    codeQr: config.get('appDomain') + config.get('qrCodesUrl') + '/' + savedOrder.codeQr,
                    codeManual: savedOrder.codeManual,
                    products: savedOrder.products
                };

                let options = this._getDefaultOptions();
                options.params.machineId = machineId;
                options.data = preparedOrder;

                return productsModel.orderProduct(options);
            })
            .then((response) => {
                let newOrderStatus = response.Return.code === 0 ? this.ORDER_STATUSES.booked
                    : this.ORDER_STATUSES.error;
                return orderModel.update({_id: preparedOrder._id}, {status: newOrderStatus});
            })
            .then((order) => {
                //TODO create transaction and all payments stuff
                helperFunctions.generateResponse(200, null, {order: order}, '', res);
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

        if (!orderId || !machineId) {
            helperFunctions.generateResponse(422, 'Wrong incoming params', null, null, res);
            return;
        }

        basicOptions.params.orderId = itemId;
        basicOptions.params.machineId = machineId;

        orderModel.cancelOrder(basicOptions)
            .then((order) => {
                helperFunctions.generateResponse(200, null, {result: order}, '', res);
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
        let bodyParams = req.body.params || {};

        console.log(bodyParams);
        console.log(orderId);

        if (!orderId) {
            helperFunctions.generateResponse(422, 'Wrong order id', null, null, res);
            return;
        }

        orderModel.update({_id: orderId}, bodyParams)
            .then((order) => {
                helperFunctions.generateResponse(200, null, {result: order}, 'Successfully updated.', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });

    }

}

const productsRoutes = new ProductsRoutes();

module.exports = productsRoutes;
