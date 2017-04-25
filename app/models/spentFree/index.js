const mongo = require('../mongo')
  , config = global.config
  , moment = require('moment')
  , Schema = mongo.Schema
  , mongoose = mongo.mongoose
  , CrudManager = require('../crud-manager');


const schema = new Schema({
  name: {
    type: String,
  },
  price: {
    type: Number
  }

});

/**
 * Comments class.
 * @constructor
 */

class SpentFree extends CrudManager{
  constructor() {
    super('SpentFree', schema);
  };
}

const spentFree = new SpentFree();
// spentFree.create({name: 'Juice', price : '50'});

module.exports = spentFree;

