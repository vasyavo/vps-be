const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , crypto = require('crypto')
    , transactionModel = require('../transactions')
    , userModel = require('../user')
    , QRGenerator = require('../qr-generator')
    , productsModel = require('../products')
    , usaEpayModel = require('../usaepay')
    , api = require('../api')
    , CrudManager = require('../crud-manager');

const Order = new Schema({
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
    reservation_expired: {
        type: String
    },
    expire: {
        type: String
    },
    notificationStatus: {
        type: String
    },
    credit_card_num: {
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
        this.schema.post('save', this.saveOrderQRCode.bind(this));
        this.transactionTypes = {
            esaePay: 'UsaEpay Transaction',
            coins: 'Coins Transaction',
            cancel: 'Canceling Order'
        };
        this.defaultExpireTime = 86400 * 3; // 3 days
        this.reservationTimeExpired = 60 * 15; //in minutes
        this.APPROVED_STATUS = 'approved';

        this.refundPercent = 0.3; //refund percent

        // userModel.getUser({login: 'v@codemotion.eu'})
        //     .then((user) => {
        //         this.processNewOrder(['32773', '32774'], '350', 'payment', user[0], 1);
        //     });
    };


    /**
     * Create order reservation
     * @param {object} queryOptions - options for reservation order on external API
     * @param {object} orderOptions - options for reservation order on external API
     * @returns {Promise} promise - promise with a result of reservation order
     */

    createOrderReservation(queryOptions, orderOptions = {}) {
        return new Promise((resolve, reject) => {
            api.orders.reservation(queryOptions.params, orderOptions, queryOptions.headers || {})
                .then(resolve)
                .catch(reject);
        });
    };


    /**
     * Get order reservation status
     * @param {object} queryOptions - options for getting status of reservation order on external API
     * @param {object} reservationId - id of order reservation
     * @returns {Promise} promise - promise with a result of reservation order status
     */

    getOrderReservationStatus(queryOptions, reservationId) {
        return new Promise((resolve, reject) => {
            queryOptions.params.reservationId = reservationId;
            api.orders.getReservationStatus(queryOptions.params, {}, queryOptions.headers || {})
                .then(resolve)
                .catch(reject);
        });
    };


    /**
     * Confirm order reservation
     * @param {object} queryOptions - options for confirm reservation order on external API
     * @param {object} reservationId - id of order reservation
     * @param {object} orderOptions - options for reservation order on external API
     * @returns {Promise} promise - promise with a result of reservation confirmation
     */

    confirmOrderReservation(queryOptions, reservationId, orderOptions) {
        return new Promise((resolve, reject) => {
            queryOptions.params.reservationId = reservationId;
            api.orders.confirmReservation(queryOptions.params, orderOptions, queryOptions.headers || {})
                .then(resolve)
                .catch(reject);
        });
    };


    /**
     * Cancel order reservation
     * @param {object} queryOptions - options for cancel reservation order on external API
     * @param {object} reservationId - id of order reservation
     * @param {object} orderOptions - options for reservation order on external API
     * @returns {Promise} promise - promise with a result of cancel reservation
     */

    cancelOrderReservation(queryOptions, reservationId, orderOptions) {
        return new Promise((resolve, reject) => {
            queryOptions.params.reservationId = reservationId;
            api.orders.cancelReservation(queryOptions.params, orderOptions, queryOptions.headers || {})
                .then(resolve)
                .catch(reject);
        });
    };


    /**
     * Process new order
     * @param {array} itemsIds - array with item ids for order
     * @param {string} machineId - machine id
     * @param {object} paymentType - payment type (coins or payment system)
     * @param {string} user - user object
     * @param {int} selectedCardIdx - selected card index
     * @returns {Promise} promise - promise with a result of reservation confirmation
     */

    processNewOrder(itemsIds, machineId, paymentType = 'esaePay', user, selectedCardIdx = 0) {
        let options = {
            params: {
                appId: 1,
                companyId: 49,
                machineId: machineId,
            },
            data: {},
            headers: {}
        };
        let currentOrder = null;
        let reservationOptions = {};

        return new Promise((resolve, reject) => {
            this._getOrderProducts(Object.assign({}, options), itemsIds)
                .then((items) => {

                    let orderSum = items.reduce((a, b) => a.articlesTariffs_VO.price + b.articlesTariffs_VO.price) - (items.length > 1 ? items.length : 0);

                    items = items.map((e) => {
                        return {
                            productId: e.productId,
                            productPriceUnit: e.articlesTariffs_VO.price,
                            productReference: e.productId,
                            productQuantity: 1,
                            productEanCode: 'yyy',
                            productName: e.productName
                        };
                    });

                    let orderEntityOptions = {
                        user_id: user._id,
                        machine_id: machineId,
                        status: 'new',
                        expire: null,
                        notificationStatus: 'new',
                        products: items,
                        credit_card_num: user.credit_cards[selectedCardIdx].maskedNum,
                        price: orderSum,
                    };
                    return this.create(orderEntityOptions);
                })
                .then((order) => {
                    currentOrder = order;

                    reservationOptions = {
                        machineId: order.machine_id,
                        codeQr: order.codeQr,
                        codeManual: order.codeManual,
                        products: order.products,
                        id: -1
                    };

                    return this.createOrderReservation(Object.assign({}, options), reservationOptions);
                })
                .then((r) => {
                    if (r.result.code != '0') {
                        throw r.result.message;
                    }
                    return this.update({_id: currentOrder._id}, {
                        status: 'reserved',
                        reservation_expired: this.reservationTimeExpired
                    });
                })
                .then((order) => {

                    if(paymentType === 'coins') { //TODO: add here check if enough coins
                        return this.APPROVED_STATUS;
                    }

                    let usaEpayData = {
                        command: 'saleCommand',
                        amount: order.price,
                        ccNumber: user.credit_cards[selectedCardIdx].token,
                        expire: '0000',
                        cvv: ''
                    };

                    return usaEpayModel.processUsaEpayRequest(usaEpayData);
                })
                .then((response) => {
                    let transactionEntity = {
                        user_id: user._id,
                        user_login: user.login,
                        order_id: currentOrder._id,
                        event: this.transactionTypes[paymentType],
                        details: '',
                        card_num: user.credit_cards[selectedCardIdx].maskedNum,
                        amount: currentOrder.price,
                        status: response.UMstatus ? response.UMstatus : response
                    };

                    return transactionModel.create(transactionEntity);
                })
                .then((transaction) => {
                    if (transaction.status.toLowerCase() !== this.APPROVED_STATUS) {
                        throw 'Transaction not approved';
                    }

                    return this.confirmOrderReservation(Object.assign({}, options), -1, reservationOptions);
                })
                .then((r) => {
                    this.update({_id: currentOrder._id}, {status: 'done', expire: moment().unix() + this.defaultExpireTime})
                        .then(resolve)
                        .catch(reject);
                })
                .catch((err) => {
                    if(currentOrder) {
                        let promises = [
                            this.cancelOrderReservation(Object.assign({}, options), -1, reservationOptions),
                            this.update({_id: currentOrder._id}, {status: 'canceled'})
                        ];

                        Promise.all(promises)
                            .then((result) => console.log(result))
                            .catch();

                    }
                    reject(err);
                });
        });

    };


    /**
     * Cancel order with refund
     * @param {string} orderId - id of order for refund
     * @param {object} user - user object
     * @returns {Promise} promise - promise with a result of canceling order
     */

    processCancelOrder(orderId, user) {

        let options = {
            params: {
                appId: 1,
                companyId: 49,
                machineId: null,
            },
            data: {},
            headers: {}
        };

        let currentOrder = null;
        let creditCardIdx = null;

        return new Promise((resolve, reject) => {
            this.find({_id: orderId})
                .then((order) => {

                    order = order[0] || null;
                    if(!order) {
                        return reject('Wrong order id');
                    }

                    currentOrder = order;
                    creditCardIdx = user.credit_cards.find((e, idx) => (e.maskedNum === order.card_num) ? idx : null);

                    let cancelOrderOptions = {
                        machineId: order.machine_id,
                        codeQr: order.codeQr,
                        codeManual: order.codeManual,
                        products: order.products,
                        id: -1
                    };
                    options.params.machineId = order.machine_id;

                    return this.cancelOrderReservation(Object.assign({}, options), cancelOrderOptions);

                })
                .then((r) => {
                    let usaEpayData = {
                        command: 'refundCommand',
                        amount: parseFloat(currentOrder.price) - parseFloat(currentOrder.price * this.refundPercent).toFixed(2),
                        ccNumber: user.credit_cards[0].token,
                        expire: '0000',
                        cvv: ''
                    };

                    return usaEpayModel.processUsaEpayRequest(usaEpayData);
                })
                .then((usaePayResponse) => {
                    let transactionEntity = {
                        user_id: user._id,
                        user_login: user.login,
                        order_id: currentOrder._id,
                        event: this.transactionTypes.cancel,
                        details: '',
                        card_num: user.credit_cards[0].maskedNum,
                        amount: parseFloat(currentOrder.price) - parseFloat(currentOrder.price * this.refundPercent).toFixed(2),
                        status: 'approved'
                    };

                    return transactionModel.create(transactionEntity)
                })
                .then(resolve)
                .catch(reject);
        });
    };


    /**
     * Load items by ids
     * @param {object} options - object with options for request
     * @param {array} itemsIds - array with item ids for order
     * @returns {Promise} promise - promise with a result of items
     */

    _getOrderProducts(options, itemsIds) {
        let promises = itemsIds.map((e) => {
            options.params.productId = e;
            return productsModel.getProduct(options);
        });
        return new Promise((resolve, reject) => {
            Promise.all(promises)
                .then(resolve)
                .catch(reject);
        });
    };


    /**
     * Cancel user order
     * @param {object} order - options for canceling order
     * @returns {Promise} promise - promise with a result of executing order
     */

    saveOrderQRCode(order) {
        let fileName = 'qr' + order._id;
        let cryptedStr = crypto.createHash("sha256").update(order._id.toString()).digest("base64");

        order.codeQr = fileName;
        order.codeManual = cryptedStr;

        QRGenerator.generateQR(cryptedStr, fileName, {})
            .then(() => {
                order.save();
            })
            .catch(() => {
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
