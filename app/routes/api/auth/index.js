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
    constructor() {
        this.emailPattern = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
    };


    /**
     * Authorize user handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    authorizeUserHandler(req, res, next) {
        let login = req.body.login || '';
        let password = req.body.password || '';

        if (login.length < 3 || password.length < 5 || !this.emailPattern.test(login)) {
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

        if ( (userInfo.login && userInfo.login.length < 3)
            || (userInfo.password && userInfo.password.length < 5) ) {
            helperFunctions.generateResponse(422, 'Incorrect info for registration', null, null, res);
            return;
        }

        userModel.registerUser(userInfo)
            .then((user) => {
                helperFunctions.generateResponse(200, null, {user: user}, 'Account successfully created.', res);
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
                helperFunctions.generateResponse(200, null, {user: user}, '', res);
            } )
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            } );
    };


    /**
     * Forgot password handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    forgotPasswordHandler(req, res, next) {
        let email = req.body.login || null;

        if (!email || !this.emailPattern.test(email)) {
            helperFunctions.generateResponse(422, 'Bad data for restoring password', null, null, res);
            return;
        }

        userModel.restorePassword(email.trim())
            .then((user) => {
                helperFunctions.generateResponse(200, null, {user: user}, 'Email sent.', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, 'User does not exist.', null, null, res);
            });
    };


    /**
     * Change password handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    changePasswordHandler(req, res, next) {
        let hash = req.params.hash || null;
        let password = req.body.password || null;
        let confirmPassowrd = req.body.confirmPassowrd || null;

        if(!hash || !password || password !== confirmPassowrd) {
            helperFunctions.generateResponse(422, 'Bad data for restoring password', null, null, res);
            return;
        }

        userModel.changePassword(hash, password)
            .then((user) => {
                helperFunctions.generateResponse(200, null, {user: user}, 'Email sent.', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, 'User does not exist.', null, null, res);
            });
    };


    /**
     * Update user info
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    updateUserInfoHandler(req, res, next) {
        let userId = req.params.id || null;
        let updateOptions = req.body || {};

        if(!userId) {
            helperFunctions.generateResponse(422, 'Wrong user id', null, null, res);
            return;
        }

        userModel.updateUser({_id: userId}, updateOptions)
            .then((user) => {
                helperFunctions.generateResponse(200, null, {user: user}, 'Successfully updated.', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, 'User does not exist.', null, null, res);
            });
    };


    /**
     * Facebook register handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    facebookAuthHandler(req, res, next) {
        let userId = req.params.id || null;
        let facebookData = req.body || {};

        if(!userId) {
            userModel.registerUser({facebook_data: facebookData})
                .then((user) => {
                    helperFunctions.generateResponse(200, null, {user: user}, 'Successfully registered.', res);
                })
                .catch((err) => {
                    console.log(err);
                    helperFunctions.generateResponse(422, 'User does not exist.', null, null, res);
                });
        } else {
            userModel.updateUser({_id: userId}, {facebook_data: facebookData})
                .then((user) => {
                    helperFunctions.generateResponse(200, null, {user: user}, 'Facebook account successfully attached.', res);
                })
                .catch((err) => {
                    helperFunctions.generateResponse(422, 'User does not exist.', null, null, res);
                });
        }


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
