const fs                  = require('fs')
    , config              = global.config
    , mailgun             = require('../mailgun')
    , ejs                 = require('ejs');



/**
 * Mailer class.
 * @constructor
 */

class Mailer {


    constructor() {};
    /**
     * Send email method
     * @param {object} options - object with config options
     */

     sendEmail(options, callback = function () {}) {
         this._setOptions(options);

         this._getTemplate( (err, content) => {

             if ( err ) {
                 console.log(err);
                 return;
             }

             let renderedHtml = ejs.render(content, {data: this.data});
             let subject = this._getMailSubject();

             mailgun.sendMailgunEmail(this.emailTo, renderedHtml, subject, this.file, callback);

         });
     };


    /**
     * Get mail subject
     * @returns {string} - email subject string
     */

    _getMailSubject() {
        let subject = {
            'thank_you': 'Thank you for payment',
            'confirm_registration': 'Confirm your account',
            'restore_password': 'Restore your password',
            'password_changed': 'Password successfully changed',
        };
        return subject[this.eventType];
    };


    /**
     * Get template html
     * @param {function} callback - callback function after getting template
     */

    _getTemplate(callback) {
        let filePath = __dirname + '/../../../email_templates/' + this.eventType + '.ejs';
        fs.readFile(filePath, 'utf8', callback);
    };


    /**
     * Set options
     * @param {object} options - object with config options
     */

     _setOptions(options) {
        let _defaultOptions = {
        	eventType: 'thank_you',
            data: {},
            emailTo: 'v@codemotion.eu',
            file: null
    	};

        for(let option in _defaultOptions) {
    		this[option] = options && options[option] !== undefined
                ? options[option]
                : _defaultOptions[option];
    	}
    };

};

const mailer = new Mailer();

module.exports = mailer;
