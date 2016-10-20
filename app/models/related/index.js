const mongo = require('../mongo')
    , config = global.config
    , moment = require('moment')
    , Schema = mongo.Schema
    , mongoose = mongo.mongoose
    , CrudManager = require('../crud-manager');


const Related = new Schema({
    item_id: {
        type: String,
    },
    related_products: {
        type: Array
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
    }
];

/**
 * Comments class.
 * @constructor
 */

class RelatedManager extends CrudManager{
    constructor() {
        super('Related', Related, preMethods);
    };

}

const relatedManager = new RelatedManager();
module.exports = relatedManager;

