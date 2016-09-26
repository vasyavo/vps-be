const mongo    	        = require('../mongo')
    , config            = global.config
    , async             = require('async')
    , bcrypt            = require('bcryptjs')
    , crypto            = require('crypto')
    , moment            = require('moment')
    , dataTables        = require('mongoose-datatables')
    , jwt               = require("jsonwebtoken")
    , Schema            = mongo.Schema
    , mongoose          = mongo.mongoose
    , mailerModel       = require('../mailer')
    , helperFunctions   = require('../helpers');


let Users = new Schema({
	login: {
        type: String,
        required: true,
        unique: true
    },
	token: {
        type: Array
    },
    confirm_hash: {
        type: String
    },
	password: {
        type: String,
        required: true
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
	time_register: {
        type: String
    },
    status: {
        type: String
    },
    roles: {
        type: Array
    }
});

Users.plugin(dataTables, {
    totalKey: 'recordsTotal',
    dataKey: 'data'
});


Users.pre('save', function(next) {

    const SALT_FACTOR = 6;
    let self = this;

    async.parallel({

        hashPass(callback) {
            bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
                bcrypt.hash(self.password, salt, (err, hash) => {
                    callback(null, hash);
                });
            });
        },

        confirmToken(callback) {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                callback(null, token);
            });
        }

    }, (err, result) => {

        if(self.isModified('password')) {
            self.password = result.hashPass;
        }

        if (!self.isModified('confirm_hash')) {
            self.confirm_hash = result.confirmToken;
        }

        if(!self.isModified('time_register')) {
            let now = moment().unix();
            self.time_register = now;
        }

        if(self.isModified('status')) {
            self.status = 'inactive';
        }

        next();

    });

});


Users.methods.comparePassword = function(password, callback) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if ( err ) {
            return callback(err);
        }

        callback(null, isMatch);
    });
};

const UsersObject = mongoose.model('Users', Users);


/**
 * Users class.
 * @constructor
 */

class UsersManager {

    constructor() {
        this.roles = [
            'admin',
            'user'
        ];
    };

    /**
     * Get users with options
     * @param {object} options - object with options for find user
     * @returns {Promise} - promise with result of getting users
     */

    getUser(options) {
        return UsersObject.find(options);
    };


    /**
     * Delete user
     * @param {object} options - object with options for deleting user
     * @returns {Promise} - promise with result of deleting users
     */

    deleteUser(options) {
        return UsersObject.findOneAndRemove(options);
    };


    /**
     * Update user
     * @param {object} findOptions - object with options for finding user
     * @param {object} updateOptions - object with options for updating user
     * @returns {Promise} - promise with result of updating users
     */

    updateUser(findOptions, updateOptions) {
        return UsersObject.findOneAndUpdate(findOptions, updateOptions, {new: true});
    };


    /**
     * Register new user
     * @param {object} options - object with options for registration user
     * @returns {Promise} - promise with result of registration user
     */

    registerUser(options) {
        let promise = new Promise((resolve, reject) => {
            this.getUser({login: options.email})
                .then((user) => {
                    user = (user && user.length) ? user[0] : null;

                    if(user) {
                        return reject('Already exist');
                    }

                    let userEntity = new UsersObject(options);

                    userEntity.save()
                        .then((user) => {

                            mailerModel.sendEmail({
                                eventType: 'confirm_registration',
                                data: {
                                    userName: user.first_name || user.login,
                                    url: config.get('appDomain') + '/api/v1/users/confirm/' + user.confirm_hash
                                },
                                emailTo: user.login
                            });
                            
                            resolve(user);
                        });

                })
                .catch(reject);

        });
        return promise;
    };


    /**
     * Authenticate by login and pass
     * @param {string} login - user login
     * @param {string} password - user password
     * @returns {Promise} - promise with result of authenticate user
     */

    authenticateUser(login, password) {
        let promise = new Promise ((resolve, reject) => {
            UsersObject.findOne({login: login})
                .then((user) => {

                    if (!user || user.status !== 'active') {
                        reject('Wrong user name or password');
                    }

                    user.comparePassword(password, (err, isMatch) => {

                        if (err || !isMatch) {
                            return reject('Wrong user name or password');
                        }

                        let newToken = this._generateJWTToken(user);
                        user.token.push(newToken);
                        user.save()
                            .then(resolve)
                            .catch(reject);
                    });
                });
        });

        return promise;

    };


    /**
     * Logout user
     * @param {string} token - user token
     * @returns {Promise} - promise with result of logout action
     */

    logoutUser(token) {

        let promise = new Promise((resolve, reject) => {
            UsersObject.findOne({token: token})
                .then((user) => {

                    if (!user) {
                        return reject('Wrong auth token');
                    }

                    let indexFoRemovedToken = user.token.indexOf(token);
                    user.token.splice(indexFoRemovedToken, 1);

                    user.save()
                        .then(resolve)
                        .catch(reject);

                });
        });

        return promise;

    };


    /**
     * Confirm user registration
     * @param {string} confirmToken - registration confirm token
     * @param {function} callback - callback function after registration
     */

    confirmUserRegistration(confirmToken) {
        let promise = new Promise((resolve, reject) => {
            UsersObject.findOne({confirm_hash: confirmToken})
                .then((user) => {

                    if(!user) {
                        return reject('Wrong confirm token');
                    }

                    user.status = 'active';
                    user.confirm_hash = '';
                    user.roles.push('user');

                    user.token.push(this._generateJWTToken(user));

                    user.save()
                        .then(resolve)
                        .catch(reject);

                });
        });

        return promise;
    };

    /**
     * Generate JWT token based on user info
     * @param {string} userName - user login
     * @param {string} password - user password
     * @returns {string} - return JWT token as string
     */

    _generateJWTToken(user) {
        let tokenExpire = 12 * 2592000; //12 month
        let signUser = {
            login: user.user_name,
            status: user.status,
            expire: tokenExpire
        };

        return jwt.sign(signUser, config.get('jwt').secret, {expiresIn: tokenExpire});
    };

};

const usersManager = new UsersManager();

module.exports = usersManager;