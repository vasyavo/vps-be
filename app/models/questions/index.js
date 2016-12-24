const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , CrudManager = require('../crud-manager');

const Questions = new Schema({
    question: {
        type: String,
    },
    answer: {
        type: String
    },
    status: {
        type: Boolean
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
 * Questions class.
 * @constructor
 */

class QuestionsManager extends CrudManager{
    constructor() {
        super('Questions', Questions, preMethods);
    };

}

const questionsManager = new QuestionsManager();
module.exports = questionsManager;
