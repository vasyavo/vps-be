const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , async = require('async')
    , raitingModel = require(__dirname + '/../../../models/raiting')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Raiting routes class.
 * @constructor
 */

class RaitingRoutes {
    constructor() {};


    /**
     * Add new raiting handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    addRaitingHandler(req, res, next) {

        let item_id = req.params.itemId || null;
        let item_name = req.body.itemName || '';
        let score = req.body.score || null;
        let user_id = req.user._id || null;
        let status = false;

        if (!item_id || !score || !user_id) {
            helperFunctions.generateResponse(422, 'Incorrect info for adding raiting', null, null, res);
            return;
        }

        raitingModel.create({item_id, score, user_id, status, item_name})
            .then((comment) => {
                helperFunctions.generateResponse(200, null, {comment: comment}, 'Thanks for your evaluation. Its under review.', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Get raiting handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getRaitingHandler(req, res, next) {
        let itemId = req.params.itemId || null;

        raitingModel.list({item_id: itemId})
            .then((raiting) => {
                helperFunctions.generateResponse(200, null, {raiting: raiting}, '', res);
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

    updateRaitingHandler(req, res, next) {
        let raitingId = req.params.raitingId || null;
        let raitingData = req.body || {};

        if (!raitingId || !Object.keys(raitingData).length) {
            helperFunctions.generateResponse(422, 'Incorrect info for updating raiting', null, null, res);
            return;
        }

        raitingModel.update({_id: raitingId}, raitingData)
            .then((raiting) => {
                helperFunctions.generateResponse(200, null, {raiting: raiting}, 'Raiting status successfully changed', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Datatable raiting handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    datatableRaitingHandler(req, res, next) {

        let productId = req.query.item_id || req.params.itemId || null;

        let options = helperFunctions.prepareDtRequest(req);
        options.search = req.query.keyword
            ? {
                value: req.query.keyword,
                fields: ['item_name', 'score']
            }
            : {};

        if (productId) {
            options.find = {item_id: productId};
        }

        options.sort['time_created'] = -1;

        raitingModel.listDatatable(options)
            .then((raitings) => {
                helperFunctions.generateResponse(200, null, {raitings: raitings}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Delete raiting handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    deleteRaitingHandler(req, res, next) {
        let raitingId = req.params.id || null;

        if (!raitingId) {
            helperFunctions.generateResponse(422, 'Incorrect info for deleting raiting', null, null, res);
            return;
        }

        commentModel.deleteComment({_id: raitingId})
            .then((comments) => {
                helperFunctions.generateResponse(200, null, {}, 'Raiting successfully deleted', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


}

const raitingRoutes = new RaitingRoutes();

module.exports = raitingRoutes;
