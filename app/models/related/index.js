const mongo = require('../mongo')
    , config = global.config
    , moment = require('moment')
    , Schema = mongo.Schema
    , mongoose = mongo.mongoose;


let Related = new Schema({
    item_id: {
        type: String,
    },
    related_products_ids: {
        type: Array
    }

});

Related.pre('save', function (next) {

    let self = this;

    if (!self.isModified('time_created')) {
        let now = moment().unix();
        self.time_created = now;
    }

    next();

});

const RelatedObject = mongoose.model('Related', Related);

/**
 * Related class.
 * @constructor
 */

class RelatedManager {

    constructor() {};

    /**
     * Get related products with options
     * @param {object} options - object with options for find related
     * @returns {Promise} - promise with result of getting related
     */

    getRelated(options) {
        let promise = new Promise((resolve, reject) => {
            if(options._id && !mongoose.Types.ObjectId.isValid(options._id)) {
                return reject('Wrong related product id');
            }
            RelatedObject.find(options)
                .then(resolve)
                .catch(reject);
        });
        return promise;
    };


    /**
     * Create related product with options
     * @param {object} options - object with options for create related product
     * @returns {Promise} - promise with result of creating related product
     */

    createRelatedProduct(options) {
        let relatedEntity = new RelatedObject(options);
        return relatedEntity.save();
    };


    /**
     * Update related
     * @param {object} findOptions - object with options for finding related products
     * @param {object} updateOptions - object with options for updating related products
     * @returns {Promise} - promise with result of updating related products
     */

    updateRelatedProduct(findOptions, updateOptions) {
        return RelatedObject.findOneAndUpdate(findOptions, updateOptions, {new: true});
    };

}

const relatedManager = new RelatedManager();

module.exports = relatedManager;
