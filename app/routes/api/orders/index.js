const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , async = require('async')
    , orderModel = require(__dirname + '/../../../models/orders')
    , productModel = require(__dirname + '/../../../models/products')
    , paymentsFactory = require(__dirname + '/../../../models/payments-factory')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Order routes class.
 * @constructor
 */

class OrderRoutes {
    constructor() {};


    /**
     * Create order handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    createOrderHandler(req, res, next) {

        let item_id = req.body.itemId || null;
        let user_id = req.user._id;
        let status = 'pending';
        let paymentType = req.body.payment || '';

        if(!item_id || !paymentType) {
            helperFunctions.generateResponse(422, 'Incorrect item_id', null, null, res);
            return;
        }

        let options = {
            params: {
                id: item_id
            },
            data: {},
            headers: {}
        };
        const paymenInstance = paymentsFactory.createPaymentInstance(paymentType);

        productModel.orderProduct(options)
            .then((product) => {
                let productOptions = {
                    item_id,
                    user_id,
                    status,
                    external_order_id: order_od,
                    price: product.price
                };
                return orderModel.create(createOptions)
            })
            .then((createdOrder) => {
                return paymenInstance.createPayment();
            })
            .then((payment) => {
                //TODO create transaction optiions;
                let transactionOptions = {};
                return paymenInstance.saveTransaction(transactionOptions);
            })
            .catch((err) => {
               console.log(err);
            });

    }


    /**
     * Get comments handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getCommentsHandler(req, res, next) {
        let itemId = req.params.itemId || null;
        let commentId = req.params.id || null;
        let visited = req.query.visited;
        let findOptions = {};

        if(typeof visited !== 'undefined') {
            findOptions['visited'] = visited;
        }

        if (itemId) {
            findOptions['item_id'] = itemId;
        }

        if(commentId) {
            findOptions['_id'] = commentId;
        }

        commentModel.list(findOptions)
            .then((comments) => {
                helperFunctions.generateResponse(200, null, {comments: comments}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Update comment handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    updateCommentHandler(req, res, next) {
        let commentId = req.params.id || null;
        let commentData = req.body || {};

        if (!commentId || !Object.keys(commentData).length) {
            helperFunctions.generateResponse(422, 'Incorrect info for updating comment', null, null, res);
            return;
        }

        commentModel.update({_id: commentId}, commentData)
            .then((comment) => {
                helperFunctions.generateResponse(200, null, {comment: comment}, 'Comment status successfully changed', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Datatable comments handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    datatableCommentsHandler(req, res, next) {

        let productId = req.query.item_id || req.params.itemId || null;

        let options = helperFunctions.prepareDtRequest(req);
        options.search = req.query.keyword
            ? {
                value: req.query.keyword,
                fields: ['title']
            }
            : {};

        if (productId) {
            options.find = {item_id: productId};
        }

        options.sort['time_created'] = -1;

        commentModel.listDatatable(options)
            .then((comments) => {
                helperFunctions.generateResponse(200, null, {comments: comments}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Delete comment handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    deleteCommentHandler(req, res, next) {
        let commentId = req.params.id || null;

        if (!commentId) {
            helperFunctions.generateResponse(422, 'Incorrect info for updating comment', null, null, res);
            return;
        }

        commentModel.delete({_id: commentId})
            .then((comments) => {
                helperFunctions.generateResponse(200, null, {}, 'Comment successfully deleted', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


}

const orderRoutes = new OrderRoutes();

module.exports = orderRoutes;
