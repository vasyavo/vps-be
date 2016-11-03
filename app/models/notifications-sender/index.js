const config = global.config
    , rp = require('request-promise');

/**
 * Push notification class.
 * @constructor
 */

class PushNotificationManager {

    constructor() {
        this.pushNotificationsConfig = config.get('pushNotifications');
        this.bodyData = {
            tokens: [],
            profile: this.pushNotificationsConfig.profile,
            notification: {
                message: '',
                payload: {
                    info: ''
                },
                android: {
                    content_available: '1',
                    data: {
                        message: '',
                        'content-available': '1'
                    }
                },
                'ios': {
                    'content_available': '1'
                }
            }
        };

        this.basicHeaders = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.pushNotificationsConfig.api_token
        };
    };



    /**
     * Send push notification
     * @param {array} devicesTokens - array with devices tokens
     * @param {string} message - message text
     * @returns {Promise} - promise with result of request
     */

    sendPushNotification(devicesTokens, message) {
        this.bodyData.tokens = devicesTokens;
        this.bodyData.notification.message = message;

        let options = {
            method: 'POST',
            uri: this.pushNotificationsConfig.url,
            headers: this.basicHeaders,
            body: this.bodyData,
            json: true
        };

        return rp(options);
    };

}

const pushNotificationManager = new PushNotificationManager();

module.exports = pushNotificationManager;
