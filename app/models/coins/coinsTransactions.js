const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , CrudManager = require('../crud-manager');


const CoinsTransactions = new Schema({
    user_id: {
        type: String
    },
    transaction_type: {
        type: String
    },
    transaction_name: {
        type: String
    },
    transaction_text: {
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
                self.time_created = moment().unix();
            }
            next();
        }
    }
];

/**
 * Coins Transactions class.
 * @constructor
 */

class CoinsTransactionsManager extends CrudManager {
    constructor() {
        super('CoinsTransactions', CoinsTransactions, preMethods);
        this.dictionaryMethods = {
            firstRegister: 'Welcome to our App!',
            facebookPost: 'Facebook posting',
            referralRegister: 'Referral registration',
            referralBought: 'Referral bought something'
        }
    };


    /**
     * Create settings object method overrided
     * @param {object} options - object with options for creating
     * @returns {Promise} - promise with result of creating entity
     */

    createOverride(options) {
        return new Promise((resolve, reject) => {
            options.transaction_text = this.dictionaryMethods[options.methodName];
            options.transaction_name = options.methodName;
            this.create(options)
                .then(resolve)
                .catch(reject);
        });
    };


}

const coinsTransactionsManager = new CoinsTransactionsManager();

module.exports = coinsTransactionsManager;
