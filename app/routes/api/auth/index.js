const fs                    = require('fs')
    , path                  = require('path')
    , moment                = require('moment')
    , async                 = require('async')
    , userModel             = require(__dirname + '/../../../models/user')
    , helperFunctions       = require(__dirname + '/../../../models/helpers');


/**
 * Admin routes class.
 * @constructor
 */

class AuthRoutes {
    constructor() {};


    /**
     * Authorize user handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    authorizeUserHandler(req, res, next) {
        let login = req.body.login || '';
        let password = req.body.password || '';

        if (login.length < 3 || password.length < 5) {
            helperFunctions.generateResponse(422, 'Incorrect info for authenticate', null, null, res);
            return;
        }

        userModel.authenticateUser(login, password)
            .then((user) => {
                user.token = user.token[user.token.length - 1];
                helperFunctions.generateResponse(200, null, {user: user}, '', res);
            } )
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            } );
    }


    /**
     * Register user handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    registerUserHandler(req, res, next) {
        let userInfo = req.body || {};

        if ( userInfo.login.length < 3 || userInfo.password.length < 5 ) {
            helperFunctions.generateResponse(422, 'Incorrect info for registration', null, null, res);
            return;
        }

        userModel.registerUser(userInfo)
            .then((user) => {
                helperFunctions.generateResponse(200, null, {user: user}, '', res);
            } )
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            } );
    };


    /**
     * Confirm user registration handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    confirmRegisterUserHandler(req, res, next) {
        let token = req.params.hash || null;

        if ( !token ) {
            helperFunctions.generateResponse(422, 'Incorrect hash params', null, null, res);
            return;
        }

        userModel.confirmUserRegistration(token)
            .then((user) => {
                console.log(user);
                helperFunctions.generateResponse(200, null, {user: user}, '', res);
            } )
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            } );
    };


    /**
     * Logout user handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    logoutUserHandler (req, res, next) {
        let token = req.headers['x-access-token'];

        userModel.logoutUser( token )
            .then( (user) => {
                helperFunctions.generateResponse(200, null, {}, 'Successfully logged out', res);
            } )
            .catch( (err) => {
                helperFunctions.generateResponse(401, err, null, null, res);
            } );
    };




};

const authRoutes = new AuthRoutes();

module.exports = authRoutes;
