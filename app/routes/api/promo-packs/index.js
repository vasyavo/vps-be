const fs = require('fs')
    , path = require('path')
    , moment = require('moment')
    , async = require('async')
    , promoPacksModel = require(__dirname + '/../../../models/promo-packs')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Promo packages routes class.
 * @constructor
 */

class PromoPackRoutes {
    constructor() {};


    /**
     * Add new promo pack handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    addPromoPackageHandler(req, res, next) {

        let product_ids = req.body.product_ids || [];
        let price = req.body.price || null;
        let free = req.body.free || null;
        let expire = req.body.expire || null;
        let name = req.body.name || 'Unnamed Package';

        if (!product_ids.length || !expire || !name) {
            helperFunctions.generateResponse(422, 'Incorrect info for adding package', null, null, res);
            return;
        }

        promoPacksModel.create({product_ids, price, free, expire, name})
            .then((promoPackage) => {
                helperFunctions.generateResponse(200, null, {promoPackage: promoPackage}, 'Package successfully created.', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Get promo package handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getPromoPackageHandler(req, res, next) {
        let packageId = req.params.packId || null;
        let options = packageId ? {_id: packageId, free: {$ne: true}} : {free: {$ne: true}};


        promoPacksModel.list(options)
            .then((promoPackage) => {
                helperFunctions.generateResponse(200, null, {promoPackage: promoPackage}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Update package handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    updatePromoPackageHandler(req, res, next) {
        let packageId = req.params.packId || null;
        let packageData = req.body || {};

        if (!packageId || !Object.keys(packageData).length) {
            helperFunctions.generateResponse(422, 'Incorrect info for updating package', null, null, res);
            return;
        }

        promoPacksModel.update({_id: packageId}, packageData)
            .then((promoPackage) => {
                helperFunctions.generateResponse(200, null, {promoPackage: promoPackage}, 'Package successfully updated', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Datatable Promo Packages handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    datatablePromoPackagesHandler(req, res, next) {

        let options = helperFunctions.prepareDtRequest(req);
        options.search = req.query.keyword
            ? {
                value: req.query.keyword,
                fields: ['name']
            }
            : {};

        options.sort['time_created'] = -1;

        promoPacksModel.listDatatable(options)
            .then((promoPackages) => {
                helperFunctions.generateResponse(200, null, {promoPackages: promoPackages}, '', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Delete promo package handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    deletePromoPackageHandler(req, res, next) {
        let packageId = req.params.packId || null;

        if (!packageId) {
            helperFunctions.generateResponse(422, 'Incorrect info for deleting package', null, null, res);
            return;
        }

        promoPacksModel.delete({_id: packageId})
            .then(() => {
                helperFunctions.generateResponse(200, null, {}, 'Package successfully deleted', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


}

const promoPackRoutes = new PromoPackRoutes();

module.exports = promoPackRoutes;
