const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , mongoose = mongo.mongoose
    , CrudManager = require('../crud-manager');


const Transaction = new Schema({
    user_id: {
        type: String,
        required: true
    },
    order_id: {
        type: String,
        required: true
    },
    payment_id: {
        type: String
    },
    event: {
        type: String
    },
    details: {
        type: String
    },
    status: {
        type: String
    },
    amount: {
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
 * Transaction class.
 * @constructor
 */

class TransactionManager extends CrudManager{
    constructor() {
        super('Transaction', Transaction, preMethods);
    };

}

const transactionManager = new TransactionManager();

module.exports = transactionManager;
