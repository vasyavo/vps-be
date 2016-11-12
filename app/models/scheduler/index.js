const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , scheduler = require('node-schedule')
    , schedulerMethods = require('./scheduler-methods')
    , CrudManager = require('../crud-manager');


const Job = new Schema({
    users_ids: {
        type: Array
    },
    job_type: {
        type: String
    },
    time_executing: {
        type: String
    },
    status: {
        type: String
    },
    date: {
        type: String
    },
    job_metod: {
        type: String
    },
    job_options: {
        type: Object
    },
    time_created: {
        type: String
    },
    executing_num: {
        type: String
    }
});

const preMethods = [
    {
        name: 'save',
        callback: function (next) {
            let self = this;
            if (!self.isModified('time_created')) {
                self.time_created = moment().unix();
            }

            next();
        }
    }
];


/**
 * Scheduler class.
 * @constructor
 */
class Scheduler extends CrudManager {

    /**
     * Init basic scheduler class
     */

    constructor() {
        super('Job', Job, preMethods);
        this.scheduler = scheduler;

        this.TYPES = {
            custom: 'CUSTOM_JOB',
            system: 'SYSTEM_JOB'
        };

        this.STATUSES = {
            NEW: 'new',
            IN_PROGRESS: 'in progress',
            EXECUTED: 'executed',
            CANCELED: 'canceled'
        };

        this.jobsInProgress = {};
        this.jobsMethods = schedulerMethods;

        this.initJobs();
    };


    /**
     * Create scheduled job with options
     * @param {object} options - options for creating job, see link for options.jobOptions - https://www.npmjs.com/package/node-schedule
     * @returns {Promise} - promise with result of creating job
     */

    createJob(options) {
        return new Promise((resolve, reject) => {
            options.job_type = this.TYPES[options.type] || this.TYPES.custom;
            options.status = this.STATUSES.NEW;
            this.create(options)
                .then((job) => {
                    return this._addNewJob(job);
                })
                .then(resolve)
                .catch(reject);

        });
    };


    /**
     * Init jobs
     * @returns {Promise} - promise with result of jobs init
     */

    initJobs() {
        return new Promise((resolve, reject) => {
            let query = {
                $or: [
                    {status: this.STATUSES.NEW},
                    {status: this.STATUSES.IN_PROGRESS}
                ]
            };

            this.list(query)
                .then((jobs) => {
                    jobs.forEach((job) => {
                        this._addNewJob(job)
                            .then(resolve)
                            .catch(reject);

                    });
                    resolve(true);
                })
                .catch(reject);
        });
    };


    /**
     * Add new job
     * @param {object} job - saved job object
     * @returns {Promise} - promise with result of creating job
     */

    _addNewJob(job) {
        return new Promise((resolve, reject) => {
            console.log(job.date);
            this.jobsInProgress[job._id] = this.scheduler.scheduleJob(job.date, () => {
                this.jobsMethods[job.job_metod].call(schedulerMethods, job.job_options || null)
                    .then((result) => {
                        if (job.job_type === this.TYPES.custom) {
                            let newStatus = job.executing_num === 'one' ? this.STATUSES.EXECUTED
                                : this.STATUSES.IN_PROGRESS;
                            this.update({_id: job}, {status: newStatus})
                                .then(resolve)
                                .catch(reject);
                        }
                    })
                    .catch(reject);
            });
        });

    };


    /**
     * Cancel scheduled job
     * @param {string} jobId - identify of job, which will be canceled
     */

    cancelJob(jobId) {
        this.jobsInProgress[jobId] && this.jobsInProgress[jobId].cancel();
        delete this.jobsInProgress[jobId];
        return this.update({_id: jobId}, {status: this.STATUSES.CANCELED});
    };
}

const schedulerInstance = new Scheduler();
module.exports = schedulerInstance;
