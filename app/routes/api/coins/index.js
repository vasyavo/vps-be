const fs = require('fs')
    , path = require('path')
    , coinsModel = require(__dirname + '/../../../models/coins')
    , usersModel = require(__dirname + '/../../../models/user')
    , coinsTransactionModel = require(__dirname + '/../../../models/coins/coinsTransactions')
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


    /**
     * Datatable coin transactions handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    listCoinTransactionsHandler(req, res, next) {
        let userId = req.params.userId || null;
        let options = {};

        if (userId) {
            options['user_id'] = userId
        }

        coinsTransactionModel.list(options)
            .then((transactions) => {
                helperFunctions.generateResponse(200, null, {transactions: transactions}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Add sharing bonuses
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    addSharingBonusesHandler(req, res, next) {
        let userId = req.params.userId || null;
        if(!userId) {
            helperFunctions.generateResponse(422, 'Incorrect info for adding bonuses', null, null, res);
            return;
        }

        usersModel.getUser({_id: userId})
            .then( user => user[0] || null)
            .then((user) => {
                return coinsModel.addBonusCoins(user, 'facebookPost')
            })
            .then((user) => {
                helperFunctions.generateResponse(200, null, {user: user}, 'Bonus coins added', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }

}

const coinsRoutes = new CoinsRoutes();

module.exports = coinsRoutes;
