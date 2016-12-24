const mongo = require('../mongo')
    , config = global.config
    , crypto = require('crypto')
    , rp = require('request-promise')
    , request = require('request')
    , helperModel = require('../helpers')
    , moment = require('moment');


/**
 * UsaEPay class manager.
 * @constructor
 */

class UsaepayManager {

    constructor() {
        this.apiKey = config.get('usaEpay').apiKey;
        this.apiUrl = config.get('usaEpay').url;
    };


    /**
     * Process request with usaEpay
     * @param {object} data - data for processing
     * @returns {Promise} - promise with result of request to usaepay
     */

    processUsaEpayRequest(data = {}) {
        let preparedData = this._prepareCreditCardData(data);
        return this._makeUsaEpayRequest(preparedData);
    }


    /**
     * Make request on usaepay
     * @param {object} data - data for processing
     * @returns {Object} - object with result of making request
     */

    _makeUsaEpayRequest(data) {
        return new Promise((resolve, reject) => {
            request.post(this.apiUrl, {form: data}, (error, response, body) => {
                try{
                    let result = response.caseless.dict.location.split('callback?')[1];
                    resolve(helperModel.queryStringParser(result));
                } catch(e) {
                    reject(e);
                }
            });
        });
    }


    /**
     * Prepare data for usaepay processing
     * @param {object} data - data for processing
     * @returns {Object} - object with prepared data
     */

    _prepareCreditCardData(data) {
        let pin = config.get('usaEpay').pin;
        let seed = '1234';
        let hashMethod = 'm'; //A one character code indicating the algorithm used. 'm' = MD5 and 's' = SHA1
        let response = 'y'; //Request a response hash. If omitted, defaults to 'n'
        let amount = data.amount || '0.00';
        let invoice = '1';
        let itemsToHash = [config.get('usaEpay')[data.command], pin, amount, invoice, seed];

        let hashedPin = crypto.createHash('md5').update(itemsToHash.join(':')).digest('hex');
        let hashedString = `${hashMethod}/${seed}/${hashedPin}/${response}`;

        return {
            UMredir: config.get('serverUrl') + 'api/v1/transaction/callback',
            UMcommand: config.get('usaEpay')[data.command],
            UMkey: config.get('usaEpay').apiKey,
            UMhash: hashedString,
            UMcard: data.ccNumber, //'4000100011112224',
            UMexpir: data.expire, //'0919',
            UMcvv: data.cvv,
            UMinvoice: invoice,
            UMamount: amount
        };
    }


}

const usaepayManager = new UsaepayManager();

module.exports = usaepayManager;
