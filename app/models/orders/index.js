const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , crypto = require('crypto')
    , transactionModel = require('../transactions')
    , userModel = require('../user')
    , QRGenerator = require('../qr-generator')
    , productsModel = require('../products')
    , CrudManager = require('../crud-manager');

const Order = new Schema({
    item_id: {
        type: String
    },
    user_id: {
        type: String
    },
    machine_id: {
        type: String
    },
    codeQr: {
        type: String
    },
    codeManual: {
        type: String
    },
    products: {
        type: Array
    },
    price: {
        type: String
    },
    time_created: {
        type: String
    },
    status: {
        type: String
    },
    expire: {
        type: String
    },
    notificationStatus: {
        type: String
    }
});

const preMethods = [
    {
        name: 'save',
        callback: function (next) {
            let self = this;
            if (!self.isModified('time_created')) {
                let now = moment().unix();
                self.time_created = now;
            }

            next();
        }
    }
];

/**
 * Order class.
 * @constructor
 */

class OrderManager extends CrudManager {
    constructor() {
        super('Order', Order, preMethods);
        this.CANCEL_TIME = 15 * 60 * 1000; //15 min
        this.schema.post('save', this.saveOrderQRCode.bind(this));
    };


    /**
     * Cancel user order
     * @param {object} order - options for canceling order
     * @returns {Promise} promise - promise with a result of executing order
     */

    saveOrderQRCode(order) {
        let fileName = 'qr' + order._id;
        let cryptedStr = crypto.createHash("sha256").update(order._id).digest("base64");

        order.codeQr = fileName;
        order.codeManual = cryptedStr;

        QRGenerator.generateQR(cryptedStr, fileName, {})
            .then(() => {
                order.save();
                next();
            })
            .catch(() => {
                next();
            });
    };


    /**
     * Cancel user order
     * @param {object} options - options for canceling order
     * @returns {Promise} promise - promise with a result of executing order
     */

    cancelOrder(options) {
        return new Promise((resolve, reject) => {
            productsModel.cancelOrder(options)
                .then((result) => {
                    return result;
                })
                .then((status) => {
                    return this.update({_id: options.params.orderId}, {status: 'canceled'})
                })
                .then(resolve)
                .catch(reject);
        });

    };


    /**
     * Execute user order
     * @param {object} order - order object
     * @returns {Promise} promise - promise with a result of executing order
     */

    executeOrder(order) {
        let promise = new Promise((resolve, reject) => {
            transactionModel.list({order_id: oreder._id})
                .then((transaction) => {
                    transaction = transaction.length ? transaction[0] : null;

                    if (!transaction) {
                        return reject('Wrong order id');
                    }

                    if (transaction.status !== 'approved') {
                        return reject('Transaction not approved');
                    }

                    let updateOrderPromise = new Promise((resolveUpdate, rejectUpdate) => {
                        this.update({_id: order._id}, {status: 'Paid'})
                            .then(resolveUpdate)
                            .catch(rejectUpdate);
                    });

                    let updateUserPromise = new Promise((resolveUpdate, rejectUpdate) => {
                        userModel.updateUser({_id: order.user_id}, {$push: {'unratedProducts': order.id}})
                            .then(resolveUpdate)
                            .catch(rejectUpdate);
                    });

                    Promise.all([updateOrderPromise, updateUserPromise])
                        .then(resolve)
                        .reject(reject);

                })
                .catch(reject);
        });

        return promise;
    };


    /**
     * Auto Order checker
     */

    orderChecker() {
        this.list({status: 'pending'})
            .then((orders) => {
                if (!orders || !orders.length) {
                    return;
                }
                for (let i = 0, l = orders.length; i < l; ++i) {
                    this.executeOrder(orders[i]);
                }

            })
            .catch(err => console.log(err));
    };

}

const orderManager = new OrderManager();

module.exports = orderManager;
