const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , async = require('async')
    , machinesModel = require(__dirname + '/../../../models/machines')
    , commentModel = require(__dirname + '/../../../models/comment')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Comment routes class.
 * @constructor
 */

class MachinesRoutes {
    constructor() {
        this.basicOptions = {
            params: {
                appId: 1,
                companyId: 49
            },
            data: {},
            headers: {}
        };
    };


    /**
     * Get machines handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getMachinesHandler(req, res, next) {
        machinesModel.getMachinesList(this.basicOptions)
            .then((machines) => {
                helperFunctions.generateResponse(200, null, {machines: machines}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Get machine handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getMachineHandler(req, res, next) {
        this.basicOptions.params.machineId = req.params.machineId;
        machinesModel.getMachine(this.basicOptions)
            .then((result) => {
                helperFunctions.generateResponse(200, null, {result: result}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }

}

const machinesRoutes = new MachinesRoutes();

module.exports = machinesRoutes;
