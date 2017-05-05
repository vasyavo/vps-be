const config = global.config
    , rp = require('request-promise')
    , crypto = require('crypto')
    , helperFunctions = require('../helpers');

/**
 * External api class.
 * @constructor
 */

class ApiManager {

    constructor() {
        this.API_URL = config.get('externalApiUrl');
        this.authToken = this._createAuthHeader();
    };


    /**
     * Send request to api
     * @param {string} url - method url
     * @param {string} method - request method
     * @param {object} params - url params of request
     * @param {object} data - body data of request
     * @param {object} headers - custom request headers
     * @returns {Promise} - promise with result of request
     */

    sendRequest(url, method = 'GET', params = {}, data = {}, headers = {}) {

        for (let key in params) {
            url = url.replace(':' + key, params[key]);
        }

        let signature = this._createSignature(params);
        headers['Authorization'] = this.authToken;

        let options = {
            method: method,
            uri: `${this.API_URL}${url}/${signature}`,
            headers: headers,
            json: true
        };

        if (Object.keys(data).length) {
            options.body = data;
        }
        return rp(options);
    };


    /**
     * Create request signature
     * @param {object} params - url params of request
     * @returns {string} - result of shashed signature with sha1 algorithm
     */

    _createSignature(params) {
        let signature = config.get('externalApiSettings').signature;
        let hashedString = Object.keys(params).map(key => params[key]).join('') + signature;
        return crypto.createHash('sha1').update(hashedString).digest('hex');
    };


    /**
     * Create auth headers
     * @param {object} params - url params of request
     * @returns {string} - result of shashed signature with sha1 algorithm
     */

    _createAuthHeader(params) {
        let userName = config.get('externalApiSettings').username;
        let password = config.get('externalApiSettings').password;
        let headerHash = new Buffer(`${userName}:${password}`).toString('base64');
        return `Basic ${headerHash}`;
    };


    /**
     * Machines methods
     * @returns {Object} - object with machines methods
     */

    get machines() {
        return {
            list: (...rest) => { return this.sendRequest('/Machines/:appId/:companyId', 'GET', ...rest); },
            get: (...rest) => { return this.sendRequest('/StockMachine/:appId/:companyId/:machineId', 'GET', ...rest); },
            getCatalog: (...rest) => { return this.sendRequest('/Catalog/:appId/:companyId/:machineId', 'GET', ...rest); }
        }
    };


    /**
     * Products methods
     * @returns {Object} - object with products methods
     */

    get products() {
        return {
            picture: (...rest) => { return this.sendRequest('/Image/:appId/:companyId/:machineId/:pictureName', 'GET', ...rest); },
            makeOrder: (...rest) => { return this.sendRequest('/saveOrder/:appId/:companyId/:machineId', 'POST', ...rest); },
            getOrderStatus: (...rest) => { return this.sendRequest('/getOrderStatus/:appId/:companyId/:machineId/:orderId', 'GET', ...rest); },
            cancelOrder: (...rest) => { return this.sendRequest('/CancelationReservation/:appId/:companyId/:machineId/:orderId', 'PUT', ...rest); },
        }
    };


    /**
     * Orders methods
     * @returns {Object} - object with products methods
     */

    get orders() {
        return {
            reservation: (...rest) => { return this.sendRequest('/Reservation/:appId/:companyId/:machineId', 'POST', ...rest); },
            getReservationStatus: (...rest) => { return this.sendRequest('/ReservationStatus/:appId/:companyId/:machineId/:reservationId', 'GET', ...rest); },
            confirmReservation: (...rest) => { return this.sendRequest('/ConfirmationReservation/:appId/:companyId/:machineId/:reservationId', 'PUT', ...rest); },
            cancelReservation: (...rest) => { return this.sendRequest('/CancelationReservation/:appId/:companyId/:machineId/:reservationId', 'PUT', ...rest); },
        }
    };

}

const apiManager = new ApiManager();

module.exports = apiManager;
