const mongo = require('../mongo')
    , dataTables = require('mongoose-datatables')
    , moment = require('moment')
    , Schema = mongo.Schema
    , mongoose = mongo.mongoose
    , CrudManager = require('../crud-manager');


const Raiting = new Schema({
    item_id: {
        type: String,
    },
    item_name: {
        type: String
    },
    score: {
        type: String
    },
    user_id: {
        type: String
    },
    time_created: {
        type: String
    },
    status: {
        type: Boolean
    },
    visited: {
        type: Boolean
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
 * Raiting class.
 * @constructor
 */

class RaitingManager extends CrudManager{
    constructor() {
        super('Raiting', Raiting, preMethods);
    };


    /**
     * Bulk update for raitings
     * @param {object} findOptions - object with options for finding entity
     * @param {object} updateOptions - object with options for updating entity
     * @returns {Promise} - promise with result of updating entity
     */

    bulkUpdate(findOptions, updateOptions) {
        return this.schemaObject.update(findOptions, updateOptions, {multi: true, new: true})
    };

}

const raitingManager = new RaitingManager();

module.exports = raitingManager;
