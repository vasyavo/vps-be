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
                .then((machines) => {
                    let result = (machines.GetMachinesResult && machines.GetMachinesResult.length)
                        ? machines.GetMachinesResult
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
            let machineStock = this.api.machines.get(options.params, options.data, options.headers);
            let machineCatalog = this.api.machines.getCatalog(options.params, options.data, options.headers);
            let machinePictures = this.api.products.pictures(options.params, options.data, options.headers);
            Promise.all([machineStock, machineCatalog, machinePictures])
                .then(resolve)
                .catch(reject);
        });
    };

}

const machinesManager = new MachinesManager();

module.exports = machinesManager;
