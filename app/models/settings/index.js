const mongo = require('../mongo')
  , moment = require('moment')
  , Schema = mongo.Schema
  , CrudManager = require('../crud-manager');

const Settings = new Schema({
  mail: {
    type: String,
  },
  telephone: {
    type: String
  }
});

/**
 * Questions class.
 * @constructor
 */

class SettingsManager extends CrudManager {
  constructor() {
    super('Settings', Settings);
  };

}

const settingsManager = new SettingsManager();
module.exports = settingsManager;
