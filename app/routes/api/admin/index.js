const moment = require('moment')
    , async = require('async')
    , mime = require('mime')
    , fs = require('fs')
    , userModel = require(__dirname + '/../../../models/user')
    , mailerModel = require(__dirname + '/../../../models/mailer')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Admin routes class.
 * @constructor
 */

class AdminRoutes {
    constructor() {
        this.unauthorizedRoutes = [
            'users/login',
            'users/register',
            'users/forgot',
            'users/confirm',
            'users/restore',
            'users/change',
            'users/facebook',
            'mobile-token'
        ];
    };


    /**
     * Checking access rights for usings APIs methods
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    checkAccessRights(req, res, next) {

        let requestedMethod = req.params[0];
        let token = req.headers['x-access-token'] || req.query.token;

        if (token) {

            if (this._checkIfUnauthorizedRoute(requestedMethod)) {
                helperFunctions.generateResponse(403, 'Bad route for authentication user', null, null, res);
                return;
            }

        } else {

            if (!this._checkIfUnauthorizedRoute(requestedMethod)) {
                helperFunctions.generateResponse(401, 'Bad route or token', null, null, res);
                return;
            }
        }

        next();

    };

    /**
     * Checking access for any route
     * @param {string} requestedMethod - requested method name
     * @returns {Boolean} - boolean access to route
     */

    _checkIfUnauthorizedRoute(requestedMethod) {
        return this.unauthorizedRoutes.some(e => requestedMethod.indexOf(e) > -1);
    };

    /**
     * Pre check function for checking admin access
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    checkAdminRights(req, res, next) {
        let token = req.headers['x-access-token'];
        userModel.getUser({token: token})
            .then((users) => {

                if (!users || !users.length) {
                    helperFunctions.generateResponse(401, 'Incorrect auth token', null, null, res);
                    return;
                }

                let user = users[0];

                if (user.roles.indexOf('admin') === -1) {
                    helperFunctions.generateResponse(401, 'Bad access rights for user.', null, null, res);
                    return;
                }

                user.token = token;
                req.user = user;
                next();
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(500, 'Server error', null, null, res);
            });
    };

}

const adminRoutes = new AdminRoutes();

module.exports = adminRoutes;
