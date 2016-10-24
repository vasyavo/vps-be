const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , transactionModel = require('../transactions')
    , userModel = require('../user')
    , CrudManager = require('../crud-manager');

const Order = new Schema({
    item_id: {
        type: String
    },
    user_id: {
        type: String
    },
    price: {
        type: String
    },
    time_created: {
        type: String
    },
    external_order_id: {
        type: String
    },
    status: {
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
