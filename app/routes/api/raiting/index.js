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
        let visited = false;

        if (!item_id || !score || !user_id) {
            helperFunctions.generateResponse(422, 'Incorrect info for adding raiting', null, null, res);
            return;
        }

        raitingModel.create({item_id, score, user_id, status, item_name, visited})
            .then((raiting) => {
                helperFunctions.generateResponse(200, null, {raiting: raiting}, 'Thanks for your evaluation. Its under review.', res);
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
        let visited = req.query.visited;
        let findOptions = {};
        if(itemId) {
            findOptions.item_id = itemId;
        }
        if(visited !== 'undefined') {
            findOptions.visited = visited;
        }

        raitingModel.list(findOptions)
            .then((raiting) => {
                helperFunctions.generateResponse(200, null, {raiting: raiting}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Update raiting handler
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
     * Bulk Update raitings handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    bulkUpdateRaitingHandler(req, res, next) {
        let raitingIds = req.body.raitingsIds || [];
        let findOptions = {
            _id: {
                $in: raitingIds
            }
        };

        raitingModel.bulkUpdate(findOptions, {visited: true})
            .then((raiting) => {
                helperFunctions.generateResponse(200, null, {raiting: raiting}, '', res);
            })
            .catch((err) => {
                console.log(err);
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

        raitingModel.delete({_id: raitingId})
            .then(() => {
                helperFunctions.generateResponse(200, null, {}, 'Raiting successfully deleted', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Calculate raiting handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    calculateRaitingHandler(req, res, next) {
        let productIds = req.body.productIds || null;

        if (!productIds) {
            helperFunctions.generateResponse(422, 'Incorrect info for calculating raiting', null, null, res);
            return;
        }

        raitingModel.calculateRaiting(productIds)
            .then((result) => {
                helperFunctions.generateResponse(200, null, {raitings: result}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


}

const raitingRoutes = new RaitingRoutes();

module.exports = raitingRoutes;
