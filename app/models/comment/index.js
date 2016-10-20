const mongo = require('../mongo')
    , config = global.config
    , async = require('async')
    , dataTables = require('mongoose-datatables')
    , moment = require('moment')
    , Schema = mongo.Schema
    , mongoose = mongo.mongoose
    , CrudManager = require('../crud-manager');

const Comment = new Schema({
    item_id: {
        type: String,
    },
    item_name: {
        type: String
    },
    user_id: {
        type: String
    },
    user_name: {
        type: String
    },
    user_email: {
        type: String
    },
    title: {
        type: String
    },
    text: {
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
 * Comments class.
 * @constructor
 */

class CommentsManager extends CrudManager{
    constructor() {
        super('Comment', Comment, preMethods);
    };

}

const commentsManager = new CommentsManager();
module.exports = commentsManager;
