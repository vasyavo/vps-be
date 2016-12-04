const admin = require('./api/admin')
    , user = require('./api/user')
    , auth = require('./api/auth')
    , comment = require('./api/comment')
    , raiting = require('./api/raiting')
    , related = require('./api/related')
    , machines = require('./api/machines')
    , products = require('./api/products')
    , transactions = require('./api/transaction')
    , promoPacks = require('./api/promo-packs')
    , coinRules = require('./api/coins')
    , api = require('../models/api')
    , jobs = require('./api/jobs')
    , multer = require('multer')
    , mongo_express = require('mongo-express/lib/middleware')
    , mongo_express_config = require('../../config/mongo-config');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/userFiles/uploads/');
    },
    onFileUploadStart: function (file) {
        if (file.mimetype !== 'image/png' || file.mimetype !== 'image/jpg' || file.mimetype !== 'image/jpeg') {
            return false;
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.png');
    }
});

const upload = multer({storage: storage});


module.exports = (app) => {

    app.all('/*', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
        res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
        next();
    });

    app.options('/*', (req, res, next) => {
        res.status(200);
        res.end();
    });

    app.all('/api/v1/*', admin.checkAccessRights.bind(admin));

    //auth routes
    app.post('/api/v1/users/login', auth.authorizeUserHandler.bind(auth));

    app.get('/api/v1/users/logout', auth.logoutUserHandler);

    app.post('/api/v1/users/register', auth.registerUserHandler);

    app.get('/api/v1/users/confirm/:hash', auth.confirmRegisterUserHandler);

    app.post('/api/v1/users/restore', auth.forgotPasswordHandler.bind(auth));

    app.post('/api/v1/users/change/:hash', auth.changePasswordHandler.bind(auth));

    app.post('/api/v1/users/facebook', auth.facebookAuthHandler.bind(auth));

    app.post('/api/v1/users/account-attach/:id', auth.facebookAttachHandler.bind(auth));

    app.put('/api/v1/users/update/:id', auth.updateUserInfoHandler.bind(auth));

    app.get('/api/v1/users/datatable', admin.checkAdminRights, user.datatableCommentsHandler);

    app.put('/api/v1/users/ban/:id', admin.checkAdminRights, user.banUserHandler);

    app.get('/api/v1/users/token', user.checkUserRights, auth.getUserByToken.bind(auth));

    app.post('/api/v1/users/send-messages', admin.checkAdminRights, user.sendMessagesHandler);

    //Comments routes

    app.post('/api/v1/comments/:itemId', user.checkUserRights, comment.createCommentHandler);

    app.get('/api/v1/comments/:itemId', comment.getCommentsHandler);

    app.get('/api/v1/comments-datatable/:itemId?', comment.datatableCommentsHandler);

    app.delete('/api/v1/comments/:id', admin.checkAdminRights, comment.deleteCommentHandler);

    app.put('/api/v1/comments/:id', admin.checkAdminRights, comment.updateCommentHandler);

    app.get('/api/v1/comment/:id?', admin.checkAdminRights, comment.getCommentsHandler);


    //Related products routes

    app.get('/api/v1/related/:id', related.getRelatedProductsHandler);

    app.put('/api/v1/related/:id', admin.checkAdminRights, related.updateRelatedProductsHandler);


    //Raiting routes

    app.post('/api/v1/raiting/:itemId', user.checkUserRights, raiting.addRaitingHandler);

    app.get('/api/v1/raiting/:itemId?', raiting.getRaitingHandler);

    app.get('/api/v1/raiting-datatable/:itemId?', raiting.datatableRaitingHandler);

    app.delete('/api/v1/raiting/:id', admin.checkAdminRights, raiting.deleteRaitingHandler);

    app.put('/api/v1/raiting/:raitingId', admin.checkAdminRights, raiting.updateRaitingHandler);

    app.put('/api/v1/raiting-bulk', admin.checkAdminRights, raiting.bulkUpdateRaitingHandler);

    app.post('/api/v1/calculate-raiting', user.checkUserRights, raiting.calculateRaitingHandler);


    //Machines routes

    app.get('/api/v1/machines', machines.getMachinesHandler.bind(machines));

    app.get('/api/v1/machine/:machineId', user.checkUserRights, machines.getMachineHandler.bind(machines));

    app.post('/api/v1/machine/:machineId', admin.checkAdminRights, upload.single('img'), machines.machineImagesUploadHandler);


    //Products routes

    app.get('/api/v1/product/:machineId/:productId', products.getProductHandler.bind(products));

    app.get('/api/v1/product-list', products.getProductListHandler.bind(products));

    app.post('/api/v1/product-order/:machineId/:productId', user.checkUserRights, products.createOrderHandler.bind(products));

    app.get('/api/v1/product-order-status/:machineId/:orderId', user.checkUserRights, products.getOrderStatusHandler.bind(products));

    app.get('/api/v1/product-order-cancel/:machineId/:orderId', user.checkUserRights, products.cancelOrderHandler.bind(products));

    app.put('/api/v1/existing-products', admin.checkAdminRights, products.updateNewProductsHandler.bind(products));


    //Jobs routes

    // app.get('/api/v1/jobs/:jobId', admin.checkAdminRights, products.getProductHandler.bind(products));

    app.get('/api/v1/jobs-datatable', admin.checkAdminRights, jobs.datatableJobsHandler.bind(jobs));

    app.post('/api/v1/jobs', admin.checkAdminRights, jobs.addJobHandler.bind(jobs));

    app.delete('/api/v1/jobs/:jobId', admin.checkAdminRights, jobs.deleteJobHandler.bind(jobs));

    app.put('/api/v1/cancel-job/:jobId', admin.checkAdminRights, jobs.cancelJobHandler.bind(jobs));

    app.put('/api/v1/job/:jobId', admin.checkAdminRights, jobs.updateJobHandler.bind(jobs));


    //Promo Packs routes

    app.get('/api/v1/promo-pack/:packId?', promoPacks.getPromoPackageHandler.bind(promoPacks));

    app.get('/api/v1/promo-pack-datatable', admin.checkAdminRights, promoPacks.datatablePromoPackagesHandler.bind(promoPacks));

    app.post('/api/v1/promo-pack', admin.checkAdminRights, promoPacks.addPromoPackageHandler.bind(promoPacks));

    app.delete('/api/v1/promo-pack/:packId', admin.checkAdminRights, promoPacks.deletePromoPackageHandler.bind(promoPacks));

    app.put('/api/v1/promo-pack/:packId', admin.checkAdminRights, promoPacks.updatePromoPackageHandler.bind(promoPacks));


    //Coins

    app.get('/api/v1/coin-rules', admin.checkAdminRights, coinRules.getRulesHandler.bind(coinRules));

    app.post('/api/v1/coin-rules', admin.checkAdminRights, coinRules.createCoinRulesHandler.bind(coinRules));

    app.put('/api/v1/coin-rules/:id', admin.checkAdminRights, coinRules.updateRuleHandler.bind(coinRules));

    app.get('/api/v1/coin-transactions/:userId', user.checkUserRights, coinRules.listCoinTransactionsHandler.bind(coinRules));

    app.post('/api/v1/coin-sharing/:userId', user.checkUserRights, coinRules.addSharingBonusesHandler.bind(coinRules));


    //Transaction routes

    app.get('/api/v1/transactions-datatable', admin.checkAdminRights, transactions.datatableTransactionsHandler);

    app.post('/api/v1/add-credit-card', user.checkUserRights, transactions.addCreditCardHandler);


    //Products Categories

    app.get('/api/v1/product-categories-list', admin.checkAdminRights, products.productCategoriesListHandler);

    app.post('/api/v1/product-categories/:id', admin.checkAdminRights, upload.single('img'), products.updateCategoryPictureHandler);


    //Mobile device tokens

    app.put('/api/v1/mobile-token', auth.saveTokenHandler);


    //Mongo express

    app.use('/mongo_express', mongo_express(mongo_express_config));

    app.use((req, res, next) => {
        res.json({'error': 404});
    });

};
