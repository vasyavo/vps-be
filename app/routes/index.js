const api 			            = require('./api')
    , admin                     = require('./api/admin')
    , auth                      = require('./api/auth')
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

    app.post('/api/v1/users/facebook/:id?', auth.facebookAuthHandler.bind(auth));

    app.put('/api/v1/users/update/:id', auth.updateUserInfoHandler.bind(auth));


    //Mongo express

    app.use('/mongo_express', mongo_express(mongo_express_config));

    app.use( (req, res, next) => {
        res.json({'error': 404});
    });

};
