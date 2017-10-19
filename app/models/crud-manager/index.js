const mongo = require('../mongo')
    , dataTables = require('mongoose-datatables')
    , mongoose = mongo.mongoose;


/**
 * Crud manager class.
 * @constructor
 */
class CrudManager {

    /**
     * Init basic crud manager
     * @param {string} name - Name of mongoose schema
     * @param {object} schema - Mongoose schema
     * @param {array} preMethods - Pre methods for mongoose schema
     */

    constructor(name, schema, preMethods = []) {
        this.schema = schema;
        this.preMethods = preMethods;
        this._setupPreMethods();
        this._initMongooseDatatable();
        this.schemaObject = mongoose.model(name, schema);
    }


    /**
     * Setup pre methods for mongoose schema
     */

    _setupPreMethods() {
        for (let i = 0, l = this.preMethods.length; i < l; ++i) {
            let currentMethod = this.preMethods[i];
            this.schema.pre(currentMethod.name, currentMethod.callback);
        }
    };

    /**
     * Init mongoose datatable plugin
     */

    _initMongooseDatatable() {
        this.schema.plugin(dataTables, {
            totalKey: 'recordsTotal',
            dataKey: 'data'
        });
    };

    /**
     * Create entity with options
     * @param {object} options - object with options for create entity
     * @returns {Promise} - promise with result of creating entity
     */

    create(options) {
        let entity = new this.schemaObject(options);
        return entity.save();
    };

    /**
     * Get entity with options
     * @param {object} options - object with options for find entity
     * @returns {Promise} - promise with result of getting entity
     */

    list(options, sort) {
      sort = sort || {};
        let promise = new Promise((resolve, reject) => {
            if(options._id && !mongoose.Types.ObjectId.isValid(options._id)) {
              reject('wrong query')
            }
          this.schemaObject.find(options).sort(sort)
                .then(resolve)
                .catch(reject);
        });
        return promise;
    };


    /**
     * Update entity
     * @param {object} findOptions - object with options for finding entity
     * @param {object} updateOptions - object with options for updating entity
     * @returns {Promise} - promise with result of updating entity
     */

    update(findOptions, updateOptions) {
        return this.schemaObject.findOneAndUpdate(findOptions, updateOptions, {new: true});
    };


    /**
     * Delete entity with options
     * @param {object} options - object with options for delete entity
     * @returns {Promise} - promise with result of deleting entity
     */

    delete(options) {
        return this.schemaObject.findOneAndRemove(options);
    };


    /**
     * Getting comment via datatables
     * @param {object} options - options for datatable search
     * @returns {Promise} - promise with result of entity list
     */

    listDatatable(options) {
        let promise = new Promise((resolve, reject) => {
            this.schemaObject.dataTables(options, (err, list) => {

                if (err) {
                    return reject(err);
                }

                resolve(list);
            });

        });

        return promise;
    };
}


module.exports = CrudManager;
