const mongo = require('../mongo')
  , moment = require('moment')
  , Schema = mongo.Schema
  , CrudManager = require('../crud-manager');

const Discount = new Schema({
  product_id: {
    type: String,
  },
  discount: {
    type: String
  },
  time_created: {
    type: String
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
 * Questions class.
 * @constructor
 */

class DiscountManager extends CrudManager {
  constructor() {
    super('Discount', Discount, preMethods);
  };

}

const discountManager = new DiscountManager();
module.exports = discountManager;
