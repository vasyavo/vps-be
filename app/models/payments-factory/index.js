const config = global.config
    , paypalPayments = require('../paypal')
    , nativePayments = require('../native-payments')
    , transactions = require('../transactions');

/**
 * Payments factory class.
 * @constructor
 */

class PaymentsFactory {

    constructor() {};

    /**
     * Create payment instance method
     * @param {string} type - type of payments object
     * @returns {Function} - payments class
     */

    createPaymentInstance(type) {
        let instance;

        if (type === 'paypal') {
            instance = new paypalPayments();
        } else if (type === 'native') {
            employee = new nativePayments();
        }

        return this.initInstance();
    };


    /**
     * Init instance with methods and types
     * @param {object} instance - instance of payment
     * @param {string} type - type of payments object
     * @returns {object} instance - payments class
     */

    initInstance(instance, type) {
        instance.type = type;

        instance.saveTransaction = (options) => {
            return transactionsModel.create(options);
        };

        instance.updateTransaction = (findOptions, updateOptions) => {
            return transactionsModel.update(findOptions, updateOptions);
        };

        return instance;
    };
}

const paymentsFactory = new PaymentsFactory();

module.exports = paymentsFactory;
