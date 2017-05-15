const fs = require('fs')
  , path = require('path')
  , spentFreeModel = require(__dirname + '/../../../models/spentFree')
  , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Related routes class.
 * @constructor
 */

class SpentFree {
  constructor() {};

  update(req, res, next) {
    const price = req.body.price;
    const id = req.body.id;
    spentFreeModel.list({})
        .then((prices => {
          if (!prices) return spentFreeModel.create({price})
      return spentFreeModel.update(id, {price})
            }))
      .then((r) => {
        helperFunctions.generateResponse(200, null, {data: r}, 'Price successfully updated', res);
      })
      .catch((err) => {
        helperFunctions.generateResponse(422, err, null, null, res);
      })
  };

  getItems(req, res, next){
    spentFreeModel.list({})
      .then((r) => {
        helperFunctions.generateResponse(200, null, {data : r}, null, res);
      })
      .catch((err) => {
        helperFunctions.generateResponse(422, err, null, null, res);
      })
  }

}

const spentFree = new SpentFree();

module.exports = spentFree;
