const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , userModel = require('../crud-manager')
    , notificationSender = require('../notifications-sender');


/**
 * Scheduler methods helper class.
 * @constructor
 */
class SchedulerMethods {

    /**
     * Init basic scheduler class
     */

    constructor() {};


    /**
     * Send custom notification
     * @param {object} options - options with custom text of notification and array of user ids
     * @returns {Promise} - promise with result of creating job
     */

    sendCustomNotification(options) {
        let findOptionsUsers = {
            _id: {$in: options.userIds}
        };

        return userModel.get(findOptionsUsers)
            .then((users = []) => {
                let deviceTokens = [];
                for (let i = 0, l = users.length; i < l; ++i) {
                    let currentUser = users[i];
                    deviceTokens = deviceTokens.concat(currentUser.device_tokens || []);
                }
                deviceTokens = deviceTokens.unique();
                return notificationSender.sendPushNotification(deviceTokens, options.message);

            });
    };

}

const schedulerMethods = new SchedulerMethods();
module.exports = schedulerMethods;
