const userModel = require(__dirname + '/../../../models/user')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * User routes class.
 * @constructor
 */

class UserRoutes {
    constructor() {};

    /**
     * Pre check function for checking executioner access
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next rout
     */

    checkUserRights(req, res, next) {
        let token = req.headers['x-access-token'];
        userModel.getUser({token: token})
            .then((users) => {

                if (!users || !users.length) {
                    helperFunctions.generateResponse(401, 'Incorrect auth token', null, null, res);
                    return;
                }

                let user = users[0];

                if (user.roles.indexOf('user') === -1) {
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

const userRoutes = new UserRoutes();

module.exports = userRoutes;
