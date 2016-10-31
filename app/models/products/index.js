const config = global.config
    , api = require('../api')
    , machinesModel = require('../machines');

/**
 * Products class.
 * @constructor
 */

class ProductManager {

    constructor() {
        this.api = api;
    };


    /**
     * Get Product
     * @param {object} options - object with options for find product
     * @returns {Promise} - promise with result of getting product
     */

    getProduct(options) {
        return new Promise((resolve, reject) => {
            machinesModel.getMachine(options)
                .then((result) => {
                    let productsStock = result[0];
                    let productCatalog = result[1];
                    let images = result[2];
                    // console.log(productsStock);
                    // console.log(productCatalog);
                    console.log(images);
                    let product = productsStock.GetStockMachineResult.stock.find((el) => {
                        return el.productId.toString() === options.params.productId;
                    });
                    resolve({product, images});
                })
                .catch(reject);
        });
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


    /**
     * Cancel order
     * @param {object} options - object with options for canceling order
     * @returns {Promise} - promise with result of canceling order status
     */

    cancelOrder(options) {
        return this.api.products.cancelOrder(options.params, options.data, options.headers);
    };

}

const productManager = new ProductManager();

module.exports = productManager;
