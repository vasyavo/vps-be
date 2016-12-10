const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , async = require('async')
    , graphicsBuilder = require(__dirname + '/../../../models/graphics-builder')
    , helperFunctions = require(__dirname + '/../../../models/helpers');

/**
 * Raiting routes class.
 * @constructor
 */

class GraphicsRoutes {
    constructor() {};


    /**
     * Get coins transactions data handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getCoinsTransactionsDataHandler(req, res, next) {
        graphicsBuilder.buildCoinsTransactionData()
            .then((data) => {
                helperFunctions.generateResponse(200, null, {data: data}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Get machines graphic data handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getMachinesTransactionsDataHandler(req, res, next) {
        let type = 'cash';
        let currentRange = req.query.range || 'A';

        graphicsBuilder.buildMachinesGraphicData(currentRange, type)
            .then((data) => {
                helperFunctions.generateResponse(200, null, {data: data}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }

}

const graphicsRoutes = new GraphicsRoutes();

module.exports = graphicsRoutes;
