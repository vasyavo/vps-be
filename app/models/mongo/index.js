const mongoose    	     = require('mongoose');
mongoose.Promise         = require('bluebird');

mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;

db.on('error', function (err) {
  console.log('connection error:', err.message);
});
db.once('open', function () {
  console.log("Connected to DB!");
});

module.exports = {
    Schema:  mongoose.Schema,
    mongoose: mongoose
};
