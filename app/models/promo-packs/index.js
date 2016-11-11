const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , CrudManager = require('../crud-manager');


const PromoPacks = new Schema({
    product_ids: {
        type: Array
    },
    price: {
        type: String
    },
    free: {
        type: Boolean
    },
    expire: {
        type: String
    },
    name: {
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
                self.time_created = moment().unix();
            }

            next();
        }
    }
];

/**
 * Promo Packs class.
 * @constructor
 */

class PromoPacksManager extends CrudManager {
    constructor() {
        super('PromoPacks', PromoPacks, preMethods);
    };
}

const promoPacksManager = new PromoPacksManager();

module.exports = promoPacksManager;
