const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , async = require('async')
    , userModel = require(__dirname + '/../../../models/user')
    , commentModel = require(__dirname + '/../../../models/comment')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Comment routes class.
 * @constructor
 */

class CommentRoutes {
    constructor() {};


    /**
     * Create comment handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    createCommentHandler(req, res, next) {
        let commentTitle = req.body.title || null;
        let commentText = req.body.text || null;
        let itemName = req.body.item_name || null;
        let itemId = req.params.itemId || null;
        let user = req.user;

        if (!commentTitle || !commentText || !itemId) {
            helperFunctions.generateResponse(422, 'Incorrect info for adding comment', null, null, res);
            return;
        }
        let commentObject = {
            title: commentTitle,
            text: commentText,
            item_id: itemId,
            item_name: itemName,
            user_id: user._id,
            user_name: user.first_name || user.login,
            user_email: user.login
        };

        commentModel.createComment(commentObject)
            .then((comment) => {
                helperFunctions.generateResponse(200, null, {comment: comment}, 'Thanks for your comment. Its under review.', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Get comments handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getCommentsHandler(req, res, next) {
        let itemId = req.params.itemId || null;
        let commentId = req.params.id || null;
        let findOptions = {};


        if (itemId) {
            findOptions['item_id'] = itemId;
        }

        if(commentId) {
            findOptions['_id'] = commentId;
        }

        commentModel.getComment(findOptions)
            .then((comments) => {
                helperFunctions.generateResponse(200, null, {comments: comments}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Update comment handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    updateCommentHandler(req, res, next) {
        let commentId = req.params.id || null;
        let commentData = req.body || {};

        if (!commentId || !Object.keys(commentData).length) {
            helperFunctions.generateResponse(422, 'Incorrect info for updating comment', null, null, res);
            return;
        }

        commentModel.updateComment({_id: commentId}, commentData)
            .then((comment) => {
                helperFunctions.generateResponse(200, null, {comment: comment}, 'Comment status successfully changed', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Datatable comments handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    datatableCommentsHandler(req, res, next) {

        let productId = req.query.item_id || req.params.itemId || null;

        let options = helperFunctions.prepareDtRequest(req);
        options.search = req.query.keyword
            ? {
                value: req.query.keyword,
                fields: ['title']
            }
            : {};

        if (productId) {
            options.find = {item_id: productId};
        }

        options.sort['time_created'] = -1;

        commentModel.getAllCommentDatatables(options)
            .then((comments) => {
                helperFunctions.generateResponse(200, null, {comments: comments}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Delete comment handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    deleteCommentHandler(req, res, next) {
        let commentId = req.params.id || null;

        if (!commentId) {
            helperFunctions.generateResponse(422, 'Incorrect info for updating comment', null, null, res);
            return;
        }

        commentModel.deleteComment({_id: commentId})
            .then((comments) => {
                helperFunctions.generateResponse(200, null, {}, 'Comment successfully deleted', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


}

const commentRoutes = new CommentRoutes();

module.exports = commentRoutes;
