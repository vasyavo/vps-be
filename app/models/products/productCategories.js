const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , CrudManager = require('../crud-manager');


const ProductCategories = new Schema({
    category_id : {
        type : String
    },
    category_name: {
        type: String
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
    }
];

/**
 * Product categories manager class.
 * @constructor
 */

class ProductCategoriesManager extends CrudManager {
    constructor() {
        super('ProductCategories', ProductCategories, preMethods);
    };

}

const productCategoriesManager = new ProductCategoriesManager();

module.exports = productCategoriesManager;
