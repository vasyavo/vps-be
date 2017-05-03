const config = global.config
    , api = require('../api')
    , existingProducts = require('./existingProducts')
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
        let productReference = options.params.productReference;
        delete options.params.productReference;

        return new Promise((resolve, reject) => {
            machinesModel.getMachine(options)
                .then((result) => {
                    resolve(result.items[productReference] || {});
                })
                .catch(reject);
        });
    };



      /**
     * Get Products list
     * @param {object} options - object with options for find product
     * @returns {Promise} - promise with result of getting product
     */

    getProductsList(options) {
        return new Promise((resolve, reject) => {
            machinesModel.getMachinesList(options)
                .then((machines) => {
                    let promisesArray = machines.map((machine) => {
                        let currentOptions = Object.assign({}, options);
                        currentOptions.params.machineId = machine.machineId;
                        return machinesModel.getMachine(currentOptions);
                    });
                    return Promise.all(promisesArray);
                })
                .then((products) => {
                    let result = {};
                    for (let i = 0, l = products.length; i < l; ++i) {
                        let currentMachineResult = products[i];
                        for (let prop in currentMachineResult.items) {
                            let currentItem = currentMachineResult.items[prop];
                            currentItem.machineId = currentMachineResult.machineId;
                        }
                        result = Object.assign(result, currentMachineResult.items);
                    }
                    this.checkNewProducts(Object.keys(result))
                        .then((newProducts) => {
                            newProducts.forEach((p) => {
                                result[p].new = true;
                            });
                            resolve(result);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    };


    /**
     * Check for new products
     * @param {array} productIds - product ids for checking
     * @returns {Promise} - promise with result of checking for new products
     */

    checkNewProducts(productIds = []) {
        return new Promise((resolve, reject) => {
            existingProducts.list({})
                .then((existingProducts) => {
                    if (!existingProducts || !existingProducts.length) {
                        resolve(productIds);
                    }
                    let newProducts = productIds.filter(e => !existingProducts[0].product_ids.includes(e));
                    resolve(newProducts);
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
