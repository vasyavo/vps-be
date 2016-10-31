const config = global.config
    , paypal = require('paypal-rest-sdk');


/**
 * Paypal manager class
 * @constructor
 */

class PaypalManager {

    /**
     * Init basic paypal configs
     */

    constructor() {
        this.devConfig = config.get('paypal_dev');
        this.liveConfig = config.get('paypal_live');
        this.paypal = paypal;
        this.paypal.configure(this.devConfig);
    };


    /**
     * Paypal payment method
     * @param {int} amount - amount of payment in USD
     * @param {string} description - description of payment
     * @returns {Promise} - promise with result of creating payment
     */

    paypalPayment(amount, description) {

        const paymentConfig = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": config.get('paypal_redirects').redirect_url,
                "cancel_url": config.get('paypal_redirects').cancel_url
            },
            "transactions": [{
                "amount": {
                    "total": amount,
                    "currency": "USD"
                },
                "description": description
            }]
        };


        return new Promise((resole, reject) => {
            this.paypal.payment.create(paymentConfig, (err, response) => {
                if (err || !response) {
                    return reject(err);
                }
                resolve(response);

            });
        });

    };


    /**
     * Execute payment after confirm from payer by payment id
     * @param {string} paymentId - id of saved payment in database
     * @param {string} payerID - id of payer, which returned from paypal
     * @returns {Promise} - promise with result of creating payment
     */

    executePayment(paymentId, payerID) {

        let payer = {
            payer_id: payerID
        };

        return new Promise((resolve, reject) => {
            this.paypal.payment.execute(paymentId, payer, (err, response) => {

                if (err) {
                    console.log(err);
                    return reject(err);
                }

                resolve(response);

            });
        });
    };


    /**
     * Get payments list
     * @returns {Promise} - promise with result of payments list
     */

    getPaymentsList() {
        return new Promise((resolve, reject) => {
            this.paypal.payment.list((err, response) => {
                if (err) {
                    return reject(err);
                }
                resolve(response);
            });
        });
    };


    /**
     * Get refund payment
     * @param {string} paymentId - paypal payment id
     * @returns {Promise} - promise with result refund payment
     */

    getRefundPayment(paymentId) {
        return new Promise((resolve, reject) => {
            this.paypal.refund.get(paymentId,  (err, response) => {
                if (err) {
                    return reject(err);
                }
                resolve(response);
            });
        });
    };


    /**
     * Create refund for payment
     * @param {string} paymentId - paypal payment id
     * @param {object} data - object with data for refund payment
     * @returns {Promise} - promise with result refund payment
     */

    createRefundPayment(paymentId, data) {
        return new Promise((resolve, reject) => {
            this.paypal.sale.refund(paymentId, data, (err, response) => {
                if (err) {
                    return reject(err);
                }
                resolve(response);
            });
        });
    };
}

const paypalManager = new PaypalManager();
module.exports = paypalManager;
