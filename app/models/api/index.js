const config = global.config
    , rp = require('request-promise')
    , helperFunctions = require('../helpers');

/**
 * External api class.
 * @constructor
 */

class ApiManager {

    constructor() {
        this.API_URL = config.get('externalApiUrl');
    };

    /**
     * Get users with options
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

        let options = {
            method: method,
            uri: this.API_URL + url,
            headers: headers,
            body: data,
            json: true
        };

        return rp(options);
    };


    /**
     * Machines methods
     * @returns {Object} - object with machines methods
     */

    get machines() {
        return {
            list: (...rest) => { return this.sendRequest('/Machines/:appId/:companyId/:signature', 'GET', ...rest); },
            get: (...rest) => { return this.sendRequest('/StockMachine/:appId/:companyId/:machineId/:signature', 'GET', ...rest); },
            getCatalog: (...rest) => { return this.sendRequest('/Catalog/:appId/:companyId/:machineId/:signature', 'GET', ...rest); }
        }
    };


    /**
     * Products methods
     * @returns {Object} - object with products methods
     */

    get products() {
        return {
            picture: (...rest) => { return this.sendRequest('/Image/:appId/:companyId/:machineId/:pictureName/:signature', 'GET', ...rest); },
            makeOrder: (...rest) => { return this.sendRequest('/saveOrder/:appId/:companyId/:machineId/:signature', 'POST', ...rest); },
            getOrderStatus: (...rest) => { return this.sendRequest('/getOrderStatus/:appId/:companyId/:machineId/:orderId/:signature', 'GET', ...rest); },
            cancelOrder: (...rest) => { return this.sendRequest('/cancelOrder/:appId/:companyId/:machineId/:orderId/:signature', 'GET', ...rest); },
        }
    };

}

const apiManager = new ApiManager();

module.exports = apiManager;
