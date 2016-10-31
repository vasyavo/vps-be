const userModel = require(__dirname + '/../../../models/user')
    , mailerModel = require(__dirname + '/../../../models/mailer')
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



    /**
     * Datatable users handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    datatableCommentsHandler(req, res, next) {

        let options = helperFunctions.prepareDtRequest(req);
        options.search = req.query.keyword
            ? {
            value: req.query.keyword,
            fields: ['title']
        }
            : {};

        options.sort['time_register'] = -1;

        userModel.getAllUsersDatatables(options)
            .then((users) => {
                helperFunctions.generateResponse(200, null, {users: users}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Ban user handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    banUserHandler(req, res, next) {

        let banStatus = req.body.status || false;
        let userId = req.params.id || null;

        if(!userId) {
            return helperFunctions.generateResponse(422, 'Wrong user id.', null, null, res);
        }

        userModel.updateUser({_id: userId}, {banned: banStatus})
            .then((user) => {
                helperFunctions.generateResponse(200, null, {user: user}, 'User status successfully updated', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }

    /**
     * Send messages handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    sendMessagesHandler(req, res, next) {

        let emailSubject = req.body.subject || null;
        let emailText = req.body.emailText || null;
        let emails = req.body.emails || [];

        if(!emailSubject || !emailText || !emails || !emails.length) {
            return helperFunctions.generateResponse(422, 'Wrong inputed data.', null, null, res);
        }
        mailerModel.sendEmail({
            eventType: 'custom_message',
            data: {
                emailSubject,
                emailText
            },
            emailTo: emails,
            subject: emailSubject
        });

        helperFunctions.generateResponse(200, null, {}, 'Message(s) successfully sended.', res);


    }

}

const userRoutes = new UserRoutes();

module.exports = userRoutes;
