const admin                     = require('./api/admin')
    , user                      = require('./api/user')
    , auth                      = require('./api/auth')
    , comment                   = require('./api/comment')
    , raiting                   = require('./api/raiting')
    , related                   = require('./api/related')
    , api                       = require('../models/api')
    , mongo_express             = require('mongo-express/lib/middleware')
    , mongo_express_config      = require('../../config/mongo-config');

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

    //Comments routes

    app.post('/api/v1/comments/:itemId', user.checkUserRights, comment.createCommentHandler);

    app.get('/api/v1/comments/:itemId', comment.getCommentsHandler);

    app.get('/api/v1/comments-datatable/:itemId?', comment.datatableCommentsHandler);

    app.delete('/api/v1/comments/:id', admin.checkAdminRights, comment.deleteCommentHandler);

    app.put('/api/v1/comments/:id', admin.checkAdminRights, comment.updateCommentHandler);

    app.get('/api/v1/comment/:id', admin.checkAdminRights, comment.getCommentsHandler);


    //Related products routes

    app.get('/api/v1/related/:id', admin.checkAdminRights, related.getRelatedProductsHandler);

    app.put('/api/v1/related/:id', admin.checkAdminRights, related.updateRelatedProductsHandler);


    //Raiting routes

    app.post('/api/v1/raiting/:itemId', user.checkUserRights, raiting.addRaitingHandler);

    app.get('/api/v1/raiting/:itemId', user.checkUserRights, raiting.getRaitingHandler);

    app.get('/api/v1/raiting-datatable/:itemId?', raiting.datatableRaitingHandler);

    app.delete('/api/v1/raiting/:id', admin.checkAdminRights, raiting.deleteRaitingHandler);

    app.put('/api/v1/raiting/:raitingId', admin.checkAdminRights, raiting.updateRaitingHandler);




    //Mongo express

    app.use('/mongo_express', mongo_express(mongo_express_config));

    app.use( (req, res, next) => {
        res.json({'error': 404});
    });

};
