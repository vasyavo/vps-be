const fs = require('fs')
  , path = require('path')
  , settingsModel = require(__dirname + '/../../../models/settings')
  , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Related routes class.
 * @constructor
 */

class Settings {
  constructor() {
    this.emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  };

  getSettings(req, res, next) {
    settingsModel.list({})
      .then((settings) => {
        if (settings.length) return helperFunctions.generateResponse(200, null, {settings: settings[0]}, null, res);
        helperFunctions.generateResponse(200, null, {settings: {}}, null, res)
      })
      .catch((e) => {
        return helperFunctions.generateResponse(422, e, {settings: {}}, null, res);
      })
  }

  updateSettings(req, res, next) {
    const telephone = req.body.telephone || '';
    const mail = req.body.mail || '';

    if (!this.emailPattern.test(mail) || !telephone.match(/\d/g) || telephone.length !== 10) {
      helperFunctions.generateResponse(422, 'Incorrect Support Settings', null, null, res);
      return;
    }

    settingsModel.list({})
      .then((settings) => {
        if (!settings || !settings.length) return settingsModel.create({telephone, mail})
        let setting = settings[0];
        return settingsModel.update({_id : setting._id}, {telephone, mail})
      })
      .then((r) => {
        helperFunctions.generateResponse(200, null, {settings: r}, 'Settings successfully updated.', res)
      })

      .catch((e) => {
        console.err(e);
        helperFunctions.generateResponse(422, e, null, null, res);
      });

    // spentFreeModel.update(id, {price})
    //   .then((r) => {
    //     helperFunctions.generateResponse(200, null, {data: r}, 'Price successfully updated', res);
    //   })
    //   .catch((err) => {
    //     helperFunctions.generateResponse(422, err, null, null, res);
    //   })
  };

}

const settings = new Settings();

module.exports = settings;
