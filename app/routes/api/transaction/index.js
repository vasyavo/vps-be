const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , transactionsModel = require(__dirname + '/../../../models/transactions')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Transactions routes class.
 * @constructor
 */

class TransactionsRoutes {
    constructor() {};

    /**
     * Datatable comments handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    datatableTransactionsHandler(req, res, next) {

        let options = helperFunctions.prepareDtRequest(req);
        options.search = req.query.keyword
            ? {
            value: req.query.keyword,
            fields: ['event', 'status', 'amount']
        }
            : {};

        options.sort['time_created'] = -1;

        transactionsModel.listDatatable(options)
            .then((transactions) => {
                helperFunctions.generateResponse(200, null, {transactions: transactions}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }

}

const transactionsRoutes = new TransactionsRoutes();

module.exports = transactionsRoutes;
