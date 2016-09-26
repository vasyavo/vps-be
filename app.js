global.config       = require('./config');

const express             = require('express')
    , app                 = express()
    , server              = app.listen(config.get('port'))
    , io                  = require('socket.io')(server)
    , middleware          = require('./app/middleware')(app, express, io)
