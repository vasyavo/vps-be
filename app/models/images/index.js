const mongo = require('../mongo')
    , moment = require('moment')
    , Schema = mongo.Schema
    , api = require('../api')
    , helper = require('../helpers')
    , CrudManager = require('../crud-manager');


const Images = new Schema({
    item_id: {
        type: String
    },
    image_name: {
        type: String
    },
    image_base64: {
        type: String
    },
    machine_id: {
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
 * Images class.
 * @constructor
 */

class ImagesManager extends CrudManager {

    constructor() {
        super('Images', Images, preMethods);
        this.api = api;
        this.options = {
            params: {
                appId: 1,
                companyId: 49
            },
            data: {},
            headers: {}
        };
    };


    /**
     * Image auto updater
     */

    autoImageUpdater() {
        this.list({})
            .then((items) => {

                if(!items || !items.length) {
                    return;
                }

                items.forEach((item) => {
                    let currentOptions = JSON.parse(JSON.stringify(this.options));
                    currentOptions.params.machineId = item.machine_id;
                    currentOptions.params.pictureName = item.image_name;

                    this.api.products.picture(currentOptions.params, currentOptions.data, currentOptions.headers)
                        .then((result) => {
                            item.image_base64 = helper.fromByteToBase64(result.DownloadImageResult.fileImage);
                            item.save()
                                .then(r => console.log(r))
                                .catch(err => console.log(err));
                        });
                });


            })
            .catch(err => console.log(err));
    };



}

const imagesManager = new ImagesManager();

module.exports = imagesManager;
