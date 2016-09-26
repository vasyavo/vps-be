const config          = global.config
    , Mailgun         = require('mailgun-js');


/**
 * Function to send email with mailgun
 * @param {string} from - sender name(string)
 * @param {string} to - recipient name(string)
 * @param {string} html - html body of email
 * @param {string} subject - subject of email
 */

const sendEmail = (to, html, subject, attachment, callback) => {
    callback = callback || function () {};

    let mailgun = new Mailgun({
        apiKey: config.get('mailgun').api,
        domain: config.get('mailgun').domain,
    });

    let data = { to, subject, html, attachment };
    data.from = config.get('mailgun').fromName

    mailgun.messages().send(data, (err, body) => {
        if (err) {
            console.log("got an error: ", err);
            return callback(err);
        }

        callback(null, body);

    });
}

module.exports.sendMailgunEmail = sendEmail;
