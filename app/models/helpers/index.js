const mongoose = require('../mongo').mongoose
    , base64 = require('base64-js');


/**
 * Unique array method
 * @returns {array} - array with unique values
 */

Array.prototype.getUnique = function () {
    let u = {}, a = [];
    for (let i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i].id)) {
            continue;
        }
        a.push(this[i]);
        u[this[i].id] = 1;
    }
    return a;
};

Array.prototype.unique = function () {
    let a = this.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) {
                a.splice(j--, 1);
            }
        }
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
            "error": errorMessage ?
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

    /**
     * Prepare object for datatables request
     * @param {object} req - request object
     * @returns {object} - object with datatable options and filters
     */

    prepareDtRequest(req) {
        let limit = req.query.limit || 10;
        let skip = req.query.skip || 0;
        let sort = {};

        if (req.query.sort_field) {
            let sortOrder = 1;

            if (req.query.sort_field[0] === '-') {
                sortOrder = -1;
                req.query.sort_field = req.query.sort_field.substr(1);
            }
            sort[req.query.sort_field] = sortOrder;

        } else {
            sort['time_created'] = -1;
        }
        return {
            limit,
            skip,
            sort
        };
    };


    /**
     * From byte array to base64 string
     * @param {array} bytesArray - array of bytes
     * @returns {string} - base64 string
     */

    fromByteToBase64(bytesArray) {
        var base64String = base64.fromByteArray(bytesArray);
        return "data:image/png;base64," + base64String;
    };


    /**
     * Query string parser
     * @param {string} queryStr - query request string
     * @returns {object} - parsed query string
     */

    queryStringParser(queryStr) {
        let match;
        let pl = /\+/g;
        let search = /([^&=]+)=?([^&]*)/g;
        let decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
        let urlParams = {};
        while (match = search.exec(queryStr)) {
            urlParams[decode(match[1])] = decode(match[2]);
        }
        return urlParams;
    };


    /**
     * Unique hash generator
     * @returns {object} - hashed string
     */

    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

}

const helpers = new Helpers();

module.exports = helpers;
