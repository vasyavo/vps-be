const config = global.config
    , api = require('../api')
    , helper = require('../helpers');

/**
 * Vending Machines class.
 * @constructor
 */

class MachinesManager {

    constructor() {
        this.api = api;
    };


    /**
     * Get Machines list with options
     * @param {object} options - object with options for find machines
     * @returns {Promise} - promise with result of getting machines
     */

    getMachinesList(options) {
        return new Promise((resolve, reject) => {
            this.api.machines.list(options.params, options.data, options.headers)
                .then((res) => {
                    console.log(res);
                    let result = (res.GetMachinesResult.machines && res.GetMachinesResult.machines.length)
                        ? res.GetMachinesResult.machines
                        : [];

                    resolve(result.filter(m => !!m.active));
                })
                .catch(reject);
        });
    };


    /**
     * Get Machines
     * @param {object} options - object with options for find machine
     * @returns {Promise} - promise with result of getting machine
     */

    getMachine(options) {
        return new Promise((resolve, reject) => {
            console.log(options);
            let machineStock = this.api.machines.get(options.params, options.data, options.headers);
            let machineCatalog = this.api.machines.getCatalog(options.params, options.data, options.headers);

            Promise.all([machineStock, machineCatalog])
                .then((result) => {
                    console.log(result);
                    let stockResult = result[0].GetStockMachineResult;
                    let catalogResult = result[1].GetCatalogResult;

                    const CATALOG_FIELDS = ['articlesTariffs_VO', 'articles_VO'];

                    let responseObject = {
                        machineId: stockResult.machineId
                    };
                    let items = {};

                    for (let i = 0, l = stockResult.stock.length; i < l; ++i) {
                        items[stockResult.stock[i].productId] = stockResult.stock[i];
                    }

                    for (let i = 0; i < CATALOG_FIELDS.length; ++i) {
                        let currentFields = CATALOG_FIELDS[i];
                        for (let j = 0, l = catalogResult[currentFields].length; j < l; ++j) {
                            let currentProductField = catalogResult[currentFields][j];

                            if (items[currentProductField.reference]) {
                                items[currentProductField.reference][currentFields] = currentProductField;
                            }
                            if (items[currentProductField.id]) {
                                items[currentProductField.id][currentFields] = currentProductField;
                            }
                        }
                    }

                    //TODO do something with images
                    responseObject.items = items;

                    this._parseImages(items, options)
                        .then((result) => {
                            for(prop in result) {
                                if(!items[prop]) {
                                    continue;
                                }
                                items[prop].articles_VO.image = helper.fromByteToBase64(result[prop].DownloadImageResult.fileImage);
                            }
                            responseObject.items = items;
                            resolve(responseObject);
                        })
                        .catch(() => {

                            resolve(responseObject);
                        })

                })
                .catch(reject);
        });
    };


    /**
     * Parse images
     * @param {object} items - object with items in machine
     * @param {object} options - object with options to send on API
     * @returns {Promise} - promise with result with parsed images
     */

    _parseImages(items, options) {
        return new Promise((resolve, reject) => {
            let promisesObject = {};

            for (let prop in items) {
                let currentItem = items[prop];

                if (!currentItem.articles_VO || !currentItem.articles_VO.image) {
                    continue;
                }

                let currentOptions = JSON.parse(JSON.stringify(options));
                currentOptions.params.pictureName = currentItem.articles_VO.image;
                promisesObject[prop] = this.api.products.picture(currentOptions.params, currentOptions.data, currentOptions.headers)

            }
            this._promisedProperties(promisesObject)
                .then(resolve)
                .catch(error);
        });
    };


    _promisedProperties(object) {

        let promisedProperties = [];
        const objectKeys = Object.keys(object);

        objectKeys.forEach((key) => promisedProperties.push(object[key]));

        return Promise.all(promisedProperties)
            .then((resolvedValues) => {
                return resolvedValues.reduce((resolvedObject, property, index) => {
                    resolvedObject[objectKeys[index]] = property;
                    return resolvedObject;
                }, object);
            });

    };

}

const machinesManager = new MachinesManager();

module.exports = machinesManager;
