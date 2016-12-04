const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , CCValidator = require('./validator')
    , transactionsModel = require(__dirname + '/../../../models/transactions')
    , usaEpayModel = require(__dirname + '/../../../models/usaepay')
    , userModel = require(__dirname + '/../../../models/user')
    , helperFunctions = require(__dirname + '/../../../models/helpers');

// usaEpayModel.createCardToken();


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


    /**
     * Add credit card handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    addCreditCardHandler(req, res, next) {
        let currentUser = req.user;
        let CCdata = req.body || {};

        let validationResult = CCValidator.validateCreditCard(CCdata.ccNumber, CCdata.CVV, CCdata.expire);

        if (!validationResult.cvv || !validationResult.expire || !validationResult.ccNumber) {
            return helperFunctions.generateResponse(422, 'Wrong Card Information.', null, null, res);
        }

        if (currentUser.credit_cards && currentUser.credit_cards.length) {
            for (let i = 0, l = currentUser.credit_cards.length; i < l; ++i) {
                let currentCreditCard = currentUser.credit_cards[i];
                let lastFour = currentCreditCard.maskedNum.substr(currentCreditCard.maskedNum.length - 4);
                let lastFourInputed = CCdata.ccNumber.substr(CCdata.ccNumber.length - 4);
                if ((lastFour === lastFourInputed) && (currentCreditCard.type.toLowerCase() === validationResult.ccNumber.toLowerCase())) {
                    return helperFunctions.generateResponse(422, 'Card already added.', null, null, res);
                }
            }
        }

        CCdata.expire = CCdata.expire.replace('/', '');
        CCdata.command = 'saveCommand';

        usaEpayModel.processUsaEpayRequest(CCdata)
            .then(result => result)
            .then((usaEpayResponse) => {
                if(usaEpayResponse.UMerror) {
                    throw usaEpayResponse.UMerror;
                }

                let creditCard = {
                    type: usaEpayResponse.UMcardType,
                    token: usaEpayResponse.UMcardRef,
                    maskedNum: usaEpayResponse.UMmaskedCardNum,
                };
                if (!currentUser.credit_cards || !currentUser.credit_cards.length) {
                    currentUser.credit_cards = [];
                }
                currentUser.credit_cards.push(creditCard);
                currentUser.markModified('credit_cards');
                return currentUser.save();
            })
            .then((userData) => {
                let transactionObj = {
                    user_id: userData._id,
                    user_login: userData.login,
                    event: 'Add Card',
                    status: 'Approved',
                    card_num: userData.credit_cards[userData.credit_cards.length - 1].maskedNum
                };

                transactionsModel.create(transactionObj).then().catch();
                helperFunctions.generateResponse(200, null, {user: userData}, '', res);
            })
            .catch((err) => {
                return helperFunctions.generateResponse(422, err, null, null, res);
            })

    }


    /**
     * Make payment with credit card handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    makePaymentHandler(req, res, next) {
        let currentUser = req.user;
        let selectedCardIdx = req.body.cardIndex || 0;

        let usaEpayData = {
            command: 'saleCommand',
            amount: '5.35',
            ccNumber: currentUser.credit_cards[selectedCardIdx].token,
            expire: '0000',
            cvv: ''
        };

        usaEpayModel.processUsaEpayRequest(usaEpayData)
            .then((usaEpayResponse) => {
                //TODO create new transaction and make order
            });

    }

}

const transactionsRoutes = new TransactionsRoutes();

module.exports = transactionsRoutes;
