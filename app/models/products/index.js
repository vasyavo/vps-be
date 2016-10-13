const config = global.config
    , api = require('../api');

/**
 * Products class.
 * @constructor
 */

class ProductManager {

    constructor() {
        this.api = api;
    };


    /**
     * Get Products list with options
     * @param {object} options - object with options for find product
     * @returns {Promise} - promise with result of getting product
     */

    getProductsList(options) {
        return this.api.products.list(options.params, options.data, options.headers);
    };


    /**
     * Get Product
     * @param {object} options - object with options for find product
     * @returns {Promise} - promise with result of getting product
     */

    getProduct(options) {
        return this.api.products.get(options.params, options.data, options.headers);
    };


    /**
     * Order product in machine
     * @param {object} options - object with options for ordering product
     * @returns {Promise} - promise with result of getting product
     */

    orderProduct(options) {
        return this.api.products.makeOrder(options.params, options.data, options.headers);
    };


    /**
     * Get order status
     * @param {object} options - object with options for getting order status
     * @returns {Promise} - promise with result of getting order status
     */

    getOrderStatus(options) {
        return this.api.products.getOrderStatus(options.params, options.data, options.headers);
    };

}

const productManager = new ProductManager();

module.exports = productManager;
