const mongo = require('../mongo')
    , config = global.config
    , async = require('async')
    , dataTables = require('mongoose-datatables')
    , moment = require('moment')
    , Schema = mongo.Schema
    , mongoose = mongo.mongoose
    , helperFunctions = require('../helpers');


let Comment = new Schema({
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

Comment.pre('save', function (next) {

    let self = this;

    if (!self.isModified('time_created')) {
        let now = moment().unix();
        self.time_created = now;
    }

    next();

});

Comment.plugin(dataTables, {
    totalKey: 'recordsTotal',
    dataKey: 'data'
});

const CommentsObject = mongoose.model('Comment', Comment);

/**
 * Comment class.
 * @constructor
 */

class CommentsManager {

    constructor() {};

    /**
     * Get comment with options
     * @param {object} options - object with options for find comment
     * @returns {Promise} - promise with result of getting comment
     */

    getComment(options) {
        let promise = new Promise((resolve, reject) => {
            if(options._id && !mongoose.Types.ObjectId.isValid(options._id)) {
                return reject('Wrong comment id');
            }
            CommentsObject.find(options)
                .then(resolve)
                .catch(reject);
        });
        return promise;
    };

    /**
     * Delete comment with options
     * @param {object} options - object with options for delete comment
     * @returns {Promise} - promise with result of deleting comments
     */

    deleteComment(options) {
        return CommentsObject.findOneAndRemove(options);
    };


    /**
     * Create comment with options
     * @param {object} options - object with options for create comment
     * @returns {Promise} - promise with result of creating comment
     */

    createComment(options) {
        let commentEntity = new CommentsObject(options);
        commentEntity.status = false;
        return commentEntity.save();
    };


    /**
     * Update comment
     * @param {object} findOptions - object with options for finding comment
     * @param {object} updateOptions - object with options for updating comment
     * @returns {Promise} - promise with result of updating comment
     */

    updateComment(findOptions, updateOptions) {
        return CommentsObject.findOneAndUpdate(findOptions, updateOptions, {new: true});
    };


    /**
     * Getting comment via datatables
     * @param {object} options - options for datatable search
     * @returns {Promise} - promise with result of comment list
     */

    getAllCommentDatatables(options) {

        let promise = new Promise((resolve, reject) => {
            CommentsObject.dataTables(options, (err, comments) => {

                if (err) {
                    return reject(err);
                }

                resolve(comments);
            });

        });

        return promise;

    };


}

const commentsManager = new CommentsManager();

module.exports = commentsManager;
