const mongoose          = require('../mongo').mongoose;


/**
 * Unique array method
 * @returns {array} - array with unique values
 */

Array.prototype.getUnique = function() {
    var u = {}, a = [];
    for (let i = 0, l = this.length; i < l; ++i) {
        if(u.hasOwnProperty(this[i].id)) {
            continue;
        }
        a.push(this[i]);
        u[this[i].id] = 1;
    }
    return a;
};

/**
 * Helpers functions class.
 * @constructor
 */

class Helpers {
    constructor() {};

    /**
     * Generating a response for each request
     * @param {int} status - response status code
     * @param {string} errorMessage - serror message text
     * @param {object} content - requested data when successed
     * @param {string} successMessage - success message text
     * @param {object} res - response object
     */

    generateResponse(status, errorMessage, content, successMessage, res) {
        status = status || 200;

        let responseObject = {
            "status": status,
            "error":
                errorMessage ?
                    {
                        "code": status,
                        "message": errorMessage,
                    } :
                    null,
            "data": {
                "content": content,
                "message": successMessage ? successMessage : null,
            }
        };

        res.status(status);
        res.json(responseObject);
    };

};

const helpers = new Helpers();

module.exports = helpers;
