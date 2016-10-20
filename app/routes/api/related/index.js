const fs = require('fs')
    , path = require('path')
    , relatedProductsModel = require(__dirname + '/../../../models/related')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Related routes class.
 * @constructor
 */

class RelatedRoutes {
    constructor() {};


    /**
     * Get related products handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getRelatedProductsHandler(req, res, next) {
        let itemId = req.params.itemId || null;

        if(!itemId) {
            return helperFunctions.generateResponse(422, 'Wrong item id', null, null, res);
        }

        relatedProductsModel.list(findOptions)
            .then((product) => {
                helperFunctions.generateResponse(200, null, {product: product}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Update related products handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    updateRelatedProductsHandler(req, res, next) {
        let itemId = req.params.id || null;
        let relatedProducts = req.body.products || [];

        if (!itemId) {
            helperFunctions.generateResponse(422, 'Wrong item id', null, null, res);
            return;
        }

        relatedProductsModel.list({item_id: itemId})
            .then((product) => {
                if(product && product.length) {
                    relatedProductsModel.update({item_id: itemId}, {related_products: relatedProducts})
                        .then(function (products) {
                            helperFunctions.generateResponse(200, null, {products: products}, 'Related products successfully updated', res);
                        })
                        .catch(function (err) {
                            helperFunctions.generateResponse(422, err, null, null, res);
                        });

                } else {
                    relatedProductsModel.create({item_id: itemId, related_products: relatedProducts})
                        .then(function (products) {
                            helperFunctions.generateResponse(200, null, {products: products}, 'Related products successfully updated', res);
                        })
                        .catch(function (err) {
                            helperFunctions.generateResponse(422, err, null, null, res);
                        });
                }

            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }

}

const relatedRoutes = new RelatedRoutes();

module.exports = relatedRoutes;
