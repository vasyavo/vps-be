const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , CrudManager = require('../crud-manager');


const ExistingProducts = new Schema({
    product_ids: {
        type: Array,
    },
    time_created: {
        type: String
    },
    time_updated: {
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
 * Existing products manager class.
 * @constructor
 */

class ExistingProductsManager extends CrudManager {
    constructor() {
        super('ExistingProducts', ExistingProducts, preMethods);
    };

}

const existingProductsManager = new ExistingProductsManager();

module.exports = existingProductsManager;
