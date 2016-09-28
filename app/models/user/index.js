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
    restore_hash: {
        type: String
    },
	password: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    facebook_data: {
        type: Object
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
        this.ACTIVE_STATTUS = 'active';
        this.INACTIVE_STATTUS = 'inactive';
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
            this.getUser({login: options.login || options.facebook_data.login})
                .then((user) => {
                    user = (user && user.length) ? user[0] : null;

                    if(user && !options.facebook_data) {
                        return reject('Already exist');
                    } else if(user && options.facebook_data) {
                        let newToken = this._generateJWTToken(user);
                        user.token.push(newToken);
                        user.save()
                            .then(resolve)
                            .catch(reject);
                        return;
                    } else {
                        let userEntity = new UsersObject(options);

                        if(userEntity.facebook_data) {
                            userEntity.login = userEntity.facebook_data.login;
                            userEntity.first_name = userEntity.facebook_data.first_name;
                            userEntity.last_name = userEntity.facebook_data.last_name;
                            userEntity.status = this.ACTIVE_STATTUS;
                            userEntity.roles = [];
                            userEntity.roles.push('user');
                            userEntity.token = [];
                            userEntity.token.push(this._generateJWTToken(user));
                        } else {
                            userEntity.status = this.INACTIVE_STATTUS;
                        }
                        
                        userEntity.save()
                            .then((user) => {

                                if(!user.facebook_data) {
                                    mailerModel.sendEmail({
                                        eventType: 'confirm_registration',
                                        data: {
                                            userName: user.first_name || user.login,
                                            url: config.get('appDomain') + '/api/v1/users/confirm/' + user.confirm_hash
                                        },
                                        emailTo: user.login
                                    });
                                }

                                resolve(user);
                            });
                    }

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

                    if (!user || user.status !== this.ACTIVE_STATTUS) {
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

                    user.status = this.ACTIVE_STATTUS;
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
     * Restore password
     * @param {string} confirmToken - registration confirm token
     * @param {function} callback - callback function after registration
     */

    restorePassword(email) {

        let promise = new Promise((resolve, reject) => {
            UsersObject.findOne({login: email})
                .then((user) => {
                    if(!user || user.status !== this.ACTIVE_STATTUS) {
                        return reject('Wrong confirm token');
                    }

                    crypto.randomBytes(15, (err, buf) => {

                        if(err) {
                            return reject(err);
                        }

                        let token = buf.toString('hex');

                        user.restore_hash = token;
                        user.save()
                            .then(resolve)
                            .catch(reject);

                        mailerModel.sendEmail({
                            eventType: 'restore_password',
                            data: {
                                userName: user.first_name || user.login,
                                url: config.get('appDomain') + '/api/v1/users/restore/' + user.restore_hash
                            },
                            emailTo: user.login
                        });

                    });

                });
        });

        return promise;
    };


    /**
     * Change user password
     * @param {string} hash - registration confirm token
     * @param {function} callback - callback function after registration
     */

    changePassword(hash, newPassword) {
        let promise = new Promise((resolve, reject) => {
            UsersObject.findOne({restore_hash: hash})
                .then((user) => {

                    if(!user) {
                        return reject('Wrong restore token');
                    }

                    user.password = newPassword;
                    user.restore_hash = null;

                    user.save()
                        .then(resolve)
                        .catch(reject);

                    mailerModel.sendEmail({
                        eventType: 'password_changed',
                        data: {
                            userName: user.first_name || user.login,
                            url: config.get('appDomain') + '/'
                        },
                        emailTo: user.login
                    });
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
            login: user.login || user.facebook_data.login,
            status: user.status,
            expire: tokenExpire
        };

        return jwt.sign(signUser, config.get('jwt').secret, {expiresIn: tokenExpire});
    };

};

const usersManager = new UsersManager();

module.exports = usersManager;
