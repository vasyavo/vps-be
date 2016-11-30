const config = global.config
    , mongo = require('../mongo')
    , Schema = mongo.Schema
    , CrudManager = require('../crud-manager')
    , moment = require('moment')
    , helper = require('../helpers');


const MachinesImages = new Schema({
    machine_id: {
        type: String,
    },
    photo: {
        type: String
    },
    time_created: {
        type: String
    }
});

const preMethods = [
    {
        name: 'save',
        callback: function (next) {
            let self = this;
            if (!self.isModified('time_created')) {
                let now = moment().unix();
                self.time_created = now;
            }

            next();
        }
    },
    {
        name: 'findOneAndUpdate',
        callback: function (next) {
            let self = this;
            self.time_updated = moment().unix();
            next();
        }
    }
];

/**
 * Vending machines images class manager.
 * @constructor
 */

class MachinesImagesManager extends CrudManager {
    constructor() {
        super('MachinesImages', MachinesImages, preMethods);
    };

}

const machinesImagesManager = new MachinesImagesManager();

module.exports = machinesImagesManager;
