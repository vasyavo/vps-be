const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , CrudManager = require('../crud-manager')
    , coinsTransactionsModel = require('../coins/coinsTransactions');


const CoinsSettings = new Schema({
    coint_worth: {
        type: String
    },
    rules: {
        type: Object
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
 * Coins Settings class.
 * @constructor
 */

class CoinsSettingsManager extends CrudManager {
    constructor() {
        super('CoinsSettings', CoinsSettings, preMethods);
        this.basicOptions = {
            coint_worth: 0,
            rules: {
                firstRegister: {
                    coinsNum: 0
                },
                facebookPost: {
                    coinsNum: 0
                },
                referralRegister: {
                    coinsNum: 0
                },
                referralBought: {
                    coinsNum: 0
                }
            }
        };
    };


    /**
     * Create settings object method overrided
     * @param {object} options - object with options for creating
     * @returns {Promise} - promise with result of creating entity
     */

    createOverride(options = this.basicOptions) {
        return new Promise((resolve, reject) => {
            this.list({})
                .then((result) => {
                    if(result.length) {
                        return reject('Already created');
                    }

                    this.create(options)
                        .then(resolve)
                        .catch(reject);
                });
        });
    };


    /**
     * Add bonus coins method
     * @param {object} user - user object to add coins
     * @param {string} action - action to adding coins
     * @returns {Promise} - promise with result of creating entity
     */

    addBonusCoins(user, action) {
        return new Promise((resolve, reject) => {
            this.list({})
                .then(options => options)
                .then((options) => {
                    user.coins = user.coins || 0;
                    user.coins += parseFloat(options.rules[action].coinsNum).toFixed(2);
                    user.save()
                        .then(resolve)
                        .catch(reject);

                    this.saveCoinTransaction(user._id, 'get', action, options.rules[action].coinsNum)
                        .then()
                        .catch();
                })
                .catch(reject);
        });
    };


    /**
     * Create new coin transaction
     * @param {object} userId - ids of user for transaction
     * @param {object} transactionType - type of transaction (get or spent)
     * @param {object} transactionName - transaction name
     * @param {string} amount - amount of transaction
     * @returns {Promise} - promise with result of creating transaction
     */

    saveCoinTransaction(userId, transactionType, transactionName, amount) {
        return new Promise((resolve, reject) => {
            let obj = {
                user_id: userId,
                transaction_type: transactionType,
                transaction_name: transactionName,
                amount: amount
            };

            coinsTransactionsModel.create(obj)
                .then(resolve)
                .catch(reject);
        });
    };

}

const coinsSettingsManager = new CoinsSettingsManager();

module.exports = coinsSettingsManager;
