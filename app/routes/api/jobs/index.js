const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , async = require('async')
    , helperFunctions = require(__dirname + '/../../../models/helpers')
    , schedulerModel = require(__dirname + '/../../../models/scheduler');


/**
 * Jobs routes class.
 * @constructor
 */

class JobsRoutes {
    constructor() {};


    /**
     * Add new job handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    addJobHandler(req, res, next) {
        let createOptions = {
            users_ids: req.body.userIds || [],
            type: req.body.jobType,
            date: req.body.date,
            job_metod: 'sendCustomNotification',
            job_options: {
                message: req.body.message
            }

        };

        schedulerModel.createJob(createOptions)
            .then((job) => {
                helperFunctions.generateResponse(200, null, {job: job}, 'Event successfully created.', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Update job handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    cancelJobHandler(req, res, next) {
        let jobId = req.params.jobId || null;

        if (!jobId) {
            helperFunctions.generateResponse(422, 'Incorrect info for updating job', null, null, res);
            return;
        }

        schedulerModel.cancelJob(jobId)
            .then((job) => {
                helperFunctions.generateResponse(200, null, {}, 'Job successfully canceled.', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }

    /**
     * Datatable jobs handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    datatableJobsHandler(req, res, next) {

        let options = helperFunctions.prepareDtRequest(req);
        options.search = req.query.keyword
            ? {
            value: req.query.keyword,
            fields: ['item_name', 'score']
        }
            : {};

        options.sort['time_created'] = -1;

        schedulerModel.listDatatable(options)
            .then((jobs) => {
                helperFunctions.generateResponse(200, null, {jobs: jobs}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Delete job handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    deleteJobHandler(req, res, next) {
        let jobId = req.params.jobId || null;

        if (!jobId) {
            helperFunctions.generateResponse(422, 'Incorrect info for deleting job', null, null, res);
            return;
        }

        schedulerModel.delete({_id: jobId})
            .then(() => {
                helperFunctions.generateResponse(200, null, {}, 'Job successfully deleted', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


}

const jobsRoutes = new JobsRoutes();

module.exports = jobsRoutes;
