const config = global.config;

module.exports = (app, express) => {

    const router              = require('../routes')
        , bodyParser          = require('body-parser')
        , methodOverride      = require('method-override')
        , cookieParser        = require('cookie-parser')

      app
        .use(cookieParser())
        .use(bodyParser.json({limit: '50mb'}))
        .use(bodyParser.urlencoded({
            extended: true
        }))
        .use(methodOverride());

    router(app);
};
