const fs = require('fs')
    , path = require('path')
    , machinesModel = require(__dirname + '/../../../models/machines')
    , machinesImagesModel = require(__dirname + '/../../../models/machines/machinesImages')
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
        let machinesOptions = JSON.parse(JSON.stringify(this.basicOptions));
        machinesModel.getMachinesList(machinesOptions)
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
        let machinesOptions = JSON.parse(JSON.stringify(this.basicOptions));
        machinesOptions.params.machineId = req.params.machineId;

        machinesModel.getMachine(machinesOptions)
            .then((result) => {
                helperFunctions.generateResponse(200, null, {result: result}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Machine images uploader handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    machineImagesUploadHandler(req, res, next) {
        let machineId = req.params.machineId || null;
        let filePath = req.file.path || null;

        if(!machineId || !filePath) {
            helperFunctions.generateResponse(422, 'Wrong incoming params', null, null, res);
            return;
        }

        filePath = filePath.replace('public/', config.get('serverUrl'));
        let findOptions = {machine_id: machineId};

        machinesImagesModel.list(findOptions)
            .then((val) => {
                if(!val || !val.length) {
                    let newImageObject = {
                        machine_id: machineId,
                        photo: filePath
                    };
                    machinesImagesModel.create(newImageObject)
                        .then((result) => {
                            helperFunctions.generateResponse(200, null, {result: result}, '', res);
                        });
                } else {
                    machinesImagesModel.update(findOptions, {photo: filePath})
                        .then((result) => {
                            helperFunctions.generateResponse(200, null, {result: result}, '', res);
                        })
                }
            })
            .catch(() => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });

    }

}

const machinesRoutes = new MachinesRoutes();

module.exports = machinesRoutes;
