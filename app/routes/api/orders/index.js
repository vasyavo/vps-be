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

        if (!item_id || !paymentType) {
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
        let transactionOptions = {
            user_id,
            status: 'pending',
            event: 'paypal payment',
            details: 'Apple juice',
            amount: 10,
        };

        //TODO: fetch product and get price and description

        productModel.orderProduct(options)
            .then((product) => {
                let productOptions = {
                    item_id,
                    user_id,
                    status,
                    external_order_id: order_od,
                    price: product.price
                };
                return orderModel.create(productOptions)
            })
            .then((createdOrder) => {
                transactionOptions.order_id = createdOrder._id;
                return paymenInstance.paypalPayment();
            })
            .then((payment) => {
                transactionOptions.payment_id = payment.id;
                return paymenInstance.saveTransaction(transactionOptions);
            })
            .catch((err) => {
                console.log(err);
            });

    };


    /**
     * Execute order handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    executeOrderHandler(req, res, next) {
        let paymentId = req.query.paymentId;
        let payerId = req.query.PayerID;

        if (!payerId || !paymentId) {
            helperFunctions.generateResponse(422, 'Incorrect payment information', null, null, res);
            return;
        }

        const paymenInstance = paymentsFactory.createPaymentInstance(paymentType);

        paymenInstance.getTransaction({payment_id: paymentId})
            .then((transactions) => {
                if(!transactions || !transactions.length) {
                    helperFunctions.generateResponse(422, 'Incorrect payment id', null, null, res);
                    return;
                }

                let currentTransaction = transactions[0];
                if(currentTransaction.status === 'approved') {
                    helperFunctions.generateResponse(422, 'Transaction already paid', null, null, res);
                    return;
                }
                return currentTransaction;
            })
            .then((transaction) => {
                return paymenInstance.executePayment(paymentId, payerId)
                    .then((paymentResult) => {
                        if (!paymentResult) {
                            helperFunctions.generateResponse(500, 'Something goes wrong', null, null, res);
                            return;
                        }

                        transaction.status = paymentResult.status;
                        return transaction.save();
                    })
                    .catch(error => console.log(error));

            })
            .then((savedTransaction) => {
                return orderModel.list({_id: savedTransaction.order_id});
            })
            .then((order) => {
                return orderModel.executeOrderHandler(order);
            })
            .then((result) => {
                helperFunctions.generateResponse(200, null, {result: result}, 'Comment status successfully changed', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(500, err, null, null, res);
            });

    };

}

const orderRoutes = new OrderRoutes();

module.exports = orderRoutes;
