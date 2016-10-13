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
        return this.api.machines.list(options.params, options.data, options.headers);
    };


    /**
     * Get Machines
     * @param {object} options - object with options for find machine
     * @returns {Promise} - promise with result of getting machine
     */

    getMachine(options) {
        return this.api.machines.get(options.params, options.data, options.headers);
    };

}

const machinesManager = new MachinesManager();

module.exports = machinesManager;
