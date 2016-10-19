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

}

const raitingManager = new RaitingManager();

module.exports = raitingManager;
