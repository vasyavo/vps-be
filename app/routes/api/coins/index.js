const fs = require('fs')
    , path = require('path')
    , coinsModel = require(__dirname + '/../../../models/coins')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Coins routes class.
 * @constructor
 */

class CoinsRoutes {
    constructor() {};


    /**
     * Create coin rules handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    createCoinRulesHandler(req, res, next) {
        let createOptions = {
            coint_worth: req.body.coint_worth || 0,
            rules: req.body.rules
        };

        coinsModel.createOverride(createOptions)
            .then((coinSettings) => {
                helperFunctions.generateResponse(200, null, {coinSettings: coinSettings}, 'Your rules successfully created!', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Get coin rules handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getRulesHandler(req, res, next) {
        coinsModel.list({})
            .then((rules) => {
                helperFunctions.generateResponse(200, null, {rules: rules[0] || null}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Update coin rule handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    updateRuleHandler(req, res, next) {
        let ruleId = req.params.id || null;
        let ruleData = req.body || {};

        if (!ruleId) {
            helperFunctions.generateResponse(422, 'Incorrect info for updating rule', null, null, res);
            return;
        }

        coinsModel.update({_id: ruleId}, ruleData)
            .then((coinSettings) => {
                helperFunctions.generateResponse(200, null, {coinSettings: coinSettings}, 'Rules successfully updated!', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }

}

const coinsRoutes = new CoinsRoutes();

module.exports = coinsRoutes;
