const mongo = require('../mongo')
    , dataTables = require('mongoose-datatables')
    , moment = require('moment')
    , Schema = mongo.Schema
    , mongoose = mongo.mongoose
    , CrudManager = require('../crud-manager');


const Raiting = new Schema({
    item_id: {
        type: String,
    },
    item_name: {
        type: String
    },
    score: {
        type: String
    },
    user_id: {
        type: String
    },
    time_created: {
        type: String
    },
    status: {
        type: Boolean
    },
    visited: {
        type: Boolean
    }

});

const preMethods = [
    {
        name: 'save',
        callback: function (next) {
            let self = this;
            if (!self.isModified('time_created')) {
                let now = moment().unix();
                self.time_created = now;
            }

            next();
        }
    }
];

/**
 * Raiting class.
 * @constructor
 */

class RaitingManager extends CrudManager {
    constructor() {
        super('Raiting', Raiting, preMethods);
    };


    /**
     * Bulk update for raitings
     * @param {object} findOptions - object with options for finding entity
     * @param {object} updateOptions - object with options for updating entity
     * @returns {Promise} - promise with result of updating entity
     */

    bulkUpdate(findOptions, updateOptions) {
        return this.schemaObject.update(findOptions, updateOptions, {
            multi: true,
            new: true
        })
    };


    /**
     * Calculate summary raiting
     * @param {object} itemIds - itemId or array with item ids
     * @returns {Promise} - promise with result of calculating raiting
     */

    calculateRaiting(itemIds) {
        let findOptions = {};

        if (itemIds instanceof Array) {
            findOptions = {
                $and: [
                    {item_id: {$in: itemIds}},
                    {status: true}
                ]
            };
        } else {
            findOptions = {
                $and: [
                    {item_id: itemIds},
                    {status: true}
                ]
            };
        }

        return new Promise((resolve, reject) => {
            this.list(findOptions)
                .then((raitings) => {
                    let result = {};
                    for (let i = 0, l = raitings.length; i < l; ++i) {
                        let currentRaiting = raitings[i];
                        let item_id = currentRaiting.item_id;

                        if(!result[item_id] || !Object.keys(result[item_id]).length) {
                            result[item_id] = {
                                numberOfItems: 0,
                                summuryRaiting: 0
                            };
                        }


                        result[item_id].numberOfItems++;
                        result[item_id].summuryRaiting += parseInt(currentRaiting.score);

                    }

                    for(let prop in result) {
                        let currRaiting = result[prop];
                        currRaiting.raiting = parseFloat(currRaiting.summuryRaiting / currRaiting.numberOfItems).toFixed(1);
                    }

                    resolve(result);

                })
                .catch(reject);
        });

    };

}

const raitingManager = new RaitingManager();

module.exports = raitingManager;
