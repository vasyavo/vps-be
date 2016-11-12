const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , userModel = require('../user')
    , ordersModel = require('../orders')
    , notificationSender = require('../notifications-sender');


/**
 * Scheduler methods helper class.
 * @constructor
 */
class SchedulerMethods {

    /**
     * Init basic scheduler class
     */

    constructor() {
        this.orderReminder = 1 * 86400; //in seconds
    };


    /**
     * Send custom notification
     * @param {object} options - options with custom text of notification and array of user ids
     * @returns {Promise} - promise with result of creating job
     */

    sendCustomNotification(options) {
        let findOptionsUsers = {
            _id: {$in: options.userIds}
        };

        return userModel.getUser(findOptionsUsers)
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


    /**
     * Check gift expires and update in database
     * @returns {Promise} - promise with result of checking gifst job
     */

    checkUserGiftsExpires() {
        let findOptionsUsers = {
            gift_packs: {
                $exists: true,
                $ne: []
            }
        };

        return userModel.getUser(findOptionsUsers)
            .then((users = []) => {
                users.forEach((user) => {
                    user.gift_packs = user.gift_packs.map((pack) => {
                        if (pack.status === 'new') {
                            let now = moment().unix();
                            if (now > pack.expireDate) {
                                pack.status = 'expired';
                            }
                        }
                        return pack;
                    });
                    user.markModified('gift_packs');
                    user.save()
                        .then()
                        .catch();
                });
            });
    };

    /**
     * Check expires orders job
     * @returns {Promise} - promise with result of checking gifst job
     */

    checkOrdersExpired() {
        let findOptionsOrders = {
            status: 'paid'
        };

        return ordersModel.list(findOptionsOrders)
            .then((orders = []) => {
                orders.forEach((order) => {
                    let now = moment().unix();
                    if (now > order.expire) {
                        order.status = 'expired';
                        order.save()
                            .then()
                            .catch();

                        //TODO make a refund with fee

                        userModel.getUser({_id: order.user_id})
                            .then((user) => {
                                if(!user || !user[0]) {
                                    return;
                                }
                                deviceTokens = user[0].device_tokens;
                                notificationSender.sendPushNotification(deviceTokens, 'Your order has expired :(');
                            })
                            .catch();
                    }
                });

            });
    };


    /**
     * Check expires orders job
     * @returns {Promise} - promise with result of checking expired orders job
     */

    remindOrders() {
        let findOptionsOrders = {
            status: 'paid'
        };

        return ordersModel.list(findOptionsOrders)
            .then((orders = []) => {
                orders.forEach((order) => {
                    let now = moment().unix();
                    if ((now + this.orderReminder > order.expire) && order.notificationStatus !== 'sended') {
                        userModel.getUser({_id: order.user_id})
                            .then((user) => {
                                if(!user || !user[0]) {
                                    return;
                                }
                                deviceTokens = user[0].device_tokens;
                                notificationSender.sendPushNotification(deviceTokens, 'One of your order has expired in less than one day');
                            })
                            .catch();

                        order.notificationStatus = 'sended';
                        order.save()
                            .then()
                            .catch(err => console.log(err));
                    }
                });

            });
    };

}

const schedulerMethods = new SchedulerMethods();
module.exports = schedulerMethods;
