const config = global.config
    , api = require('../api');

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
                    let result = (res.GetMachinesResult.machines && res.GetMachinesResult.machines.length)
                        ? res.GetMachinesResult.machines
                        : [];
                    console.log(result);

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
            let machineStock = this.api.machines.get(options.params, options.data, options.headers);
            let machineCatalog = this.api.machines.getCatalog(options.params, options.data, options.headers);
            let machinePictures = this.api.products.pictures(options.params, options.data, options.headers);
            Promise.all([machineStock, machineCatalog, machinePictures])
                .then((result) => {
                    let stockResult = result[0].GetStockMachineResult;
                    let catalogResult = result[1].GetCatalogResult;
                    let imagesResult = result[2].GetProductsPicturesResult;

                    const CATALOG_FIELDS = ['articlesTariffs_VO', 'articles_VO'];

                    let responseObject = {
                        machineId: stockResult.machineId
                    };
                    let items = {};

                    for (let i = 0, l = stockResult.stock.length; i < l; ++i) {
                        items[stockResult.stock[i].productId] = stockResult.stock[i];
                    }

                    for (let i = 0; i < CATALOG_FIELDS.length; ++i ) {
                        let currentFields = CATALOG_FIELDS[i];
                        for (let j = 0, l = catalogResult[currentFields].length; j < l; ++j) {
                            let currentProductField = catalogResult[currentFields][j];

                            if(items[currentProductField.reference]) {
                                items[currentProductField.reference][currentFields] = currentProductField;
                            }
                            if(items[currentProductField.id]) {
                                items[currentProductField.id][currentFields] = currentProductField;
                            }
                        }
                    }

                    //TODO do something with images

                    responseObject.items = items;

                    // console.log(result);
                    resolve(responseObject);
                })
                .catch(reject);
        });
    };

}

const machinesManager = new MachinesManager();

module.exports = machinesManager;
