const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , CrudManager = require('../crud-manager');

const MobileTokens = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
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

class MobileTokensManager extends CrudManager{
    constructor() {
        super('MobileTokens', MobileTokens, preMethods);
    };

}

const mobileTokensManager = new MobileTokensManager();
module.exports = mobileTokensManager;
