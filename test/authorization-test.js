const chai = require('chai')
    , chaiHttp = require('chai-http')
    , server = require('../app.js')
    , userModel = require('../app/models/user')
    , should = chai.should();

chai.use(chaiHttp);


class AuthorizationTestMethods {

    constructor() {
        this.BASE_URL = '/api/v1';
        this.userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6ImFkbWluQGZ0ci5jb20iLCJzdGF0dXMiOiJhY3RpdmUiLCJleHBpcmUiOjMxMTA0MDAwLCJpYXQiOjE0NzU4NTIzNTUsImV4cCI6MTUwNjk1NjM1NX0.p0Oqi1OlFDAEt8pRSDMbGNG8GfEYlZW2MSbflgGsXqM';
    }

    runTests() {
        // describe('User Auth', (...r) => {
        //
        //     // Registration by using wrong data
        //     describe('POST user registers by using wrong data', () => {
        //         it('It should POST and user registers by using wrong data', this._registrationWrongDataHandler.bind(this));
        //     });
        //
        //     // Registration by using correct data and confirm registration
        //     describe('POST user registers and confirm registration', () => {
        //         it('It should user registers and confirm registration', this._registrationAndConfirmHandler.bind(this));
        //     });
        //
        //
        //     //Confirm registration by using wrong token
        //     describe('GET confirm registration by using wrong token', () => {
        //         it('It should GET confirm registration by using wrong token', this._confirmRegistrationWrongTokenHandler.bind(this));
        //     });
        //
        //     // Authorization by using wrong data
        //     describe('POST authorization by using wrong data', () => {
        //         it('It should authorization by using wrong data', this._authorizationWrongDataHandler.bind(this));
        //     });
        //
        //     // Authorization by User
        //     describe('POST authorization by User', () => {
        //         it('It should authorization by User', this._authorizationUserHandler.bind(this));
        //     });
        //
        //     // User logout
        //     describe('GET User logout', () => {
        //         it('It should user logout', this._logoutUserHandler.bind(this));
        //     });
        //
        //     // Restore password - wrong email
        //     describe('POST User enters wrong email', () => {
        //         it('It should user enters wrong email', this._changePasswordWrongEmailHandler.bind(this));
        //     });
        //
        //     // Restore password - non-existent email
        //     describe('POST User enters non-existent email', () => {
        //         it('It should user enters non-existent email', this._changePasswordNonExistentEmailHandler.bind(this));
        //     });
        //
        //     // Restore and change password
        //     describe('POST User restores and changes password', () => {
        //         it('It should user restores and changes password', this._restoreAndChangePasswordHandler.bind(this));
        //     });
        //
        //
        //     // Change password (wrong length)
        //     describe('POST User changes password (wrong length)', () => {
        //         it('It should user changes password (wrong length)', this._changePasswordWrongLengthHandler.bind(this));
        //     });
        //
        //     // Change password (wrong confirming password)
        //     describe('POST User changes password (wrong confirming password)', () => {
        //         it('It should user changes password (wwrong confirming password)', this._changePasswordWrongConfirmingPassHandler.bind(this));
        //     });
        //
        //     // Login by using changed password
        //     describe('POST login by using changed password', () => {
        //         it('It should login by using changed password', this._authorizationChangedPasswordHandler.bind(this));
        //     });
        //
        //     // Login by using old password
        //     describe('POST login by using old password', () => {
        //         it('It should login by using old password', this._authorizationOldPasswordHandler.bind(this));
        //     });
        //
        // });
    };

    _registrationWrongDataHandler(done) {
        const body = {
            login: 'a@aa',
            password: '123'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/register`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(422);
                res.body.error.should.have.property('message').eql('Incorrect info for registration');
                done();
        });
    };

    _registrationAndConfirmHandler(done) {
        const body = {
            login: 'agk@codemotion.eu',
            password: '123456'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/register`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.user.should.be.a('object');
                res.body.data.should.have.property('message').eql('Account successfully created.');
                res.body.data.content.user.should.have.property('status').eql('inactive');
            
                const confirm_hash = res.body.data.content.user.confirm_hash;

                chai.request(server)
                    .get(`${this.BASE_URL}/users/confirm/${confirm_hash}`)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.data.content.user.should.be.a('object');
                        res.body.data.should.have.property('message').eql('Successfully activated.');
                        res.body.data.content.user.should.have.property('status').eql('active');
                        done();
            });
        });
    };

    _confirmRegistrationWrongTokenHandler(done) {
        const body = {
            login: 'aggs.serheeva@gmail.com',
            password: '123456'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/register`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.user.should.be.a('object');
                res.body.data.should.have.property('message').eql('Account successfully created.');
                res.body.data.content.user.should.have.property('status').eql('inactive');
            
                const confirm_hash = '12345678asdg';

                chai.request(server)
                    .get(`${this.BASE_URL}/users/confirm/${confirm_hash}`)
                    .end((err, res) => {
                        console.log(res.body);
                        res.should.have.status(422);
                        res.body.should.be.a('object');
                        res.body.error.should.have.property('message').eql('Wrong confirm token');
                        res.body.data.content.user.should.have.property('status').eql('inactive');
                        done();
            });
        //done();
        });
    };

    _authorizationWrongDataHandler(done) {
        const body = {
            login: 'ancodemotin.eu',
            password: '123456'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/login`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(422);
                res.body.error.should.have.property('message').eql('Incorrect info for authenticate');
                done();
        });
    };

    _authorizationUserHandler(done) {
        const body = {
            login: 'an@codemotion.eu',
            password: '123456',
            device: 'mobile'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/login`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.user.should.be.a('object');
                res.body.data.content.user.should.have.property('token');
                res.body.data.content.user.should.have.property('status').eql('active');
                done();
        });
    };

    _logoutUserHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/users/logout`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.user.should.be.a('object');
                res.body.data.should.have.property('message').eql('Successfully logged out');
                done();
        });
    };

    _changePasswordWrongEmailHandler(done) {
        const body = {
            email: 'ag@gmail'
        };
            chai.request(server)
                .post(`${this.BASE_URL}/users/restore`)
                .send(body)
                .end((err, res) => {
                    res.should.have.status(422);
                    res.body.error.should.have.property('message').eql('Bad data for restoring password');
                    done();
            });
    };

    _changePasswordNonExistentEmailHandler(done) {
        const body = {
            login: 'ag.yaremenko@gmail.com'
        };
            chai.request(server)
                .post(`${this.BASE_URL}/users/restore`)
                .send(body)
                .end((err, res) => {
                    res.should.have.status(422);
                    res.body.error.should.have.property('message').eql('User does not exist.');
                    done();
            });
    };

    _restoreAndChangePasswordHandler(done) {
        const body = {
            login: 'an@codemotion.eu'
        };
            chai.request(server)
                .post(`${this.BASE_URL}/users/restore`)
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.content.user.should.be.a('object');
                    res.body.data.should.have.property('message').eql('Email sent.');

                    const restore_hash = res.body.data.content.user.restore_hash;
                    const body = {
                        password: '654321',
                        confirmPassowrd: '654321'
                    };

                    chai.request(server)
                        .post(`${this.BASE_URL}/users/change/${restore_hash}`)
                        .send(body)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.data.content.user.should.be.a('object');
                            res.body.data.should.have.property('message').eql('Password successfully changed.');
                            done();
                    });
            });
    };

    _changePasswordWrongLengthHandler(done) {
        const body = {
            login: 'an@codemotion.eu'
        };
            chai.request(server)
                .post(`${this.BASE_URL}/users/restore`)
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.content.user.should.be.a('object');
                    res.body.data.should.have.property('message').eql('Email sent.');
                    
                    const restore_hash = res.body.data.content.user.restore_hash;
                    const body = {
                        password: '654',
                        confirmPassowrd: '654'
                    };

                    chai.request(server)
                        .post(`${this.BASE_URL}/users/change/${restore_hash}`)
                        .send(body)
                        .end((err, res) => {
                            res.should.have.status(422);
                            res.body.error.should.have.property('message').eql('Bad data for restoring password');
                            done();
                    });
            });
    };

    _changePasswordWrongConfirmingPassHandler(done) {
        const body = {
            login: 'an@codemotion.eu'
        };
            chai.request(server)
                .post(`${this.BASE_URL}/users/restore`)
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.content.user.should.be.a('object');
                    res.body.data.should.have.property('message').eql('Email sent.');
                    
                    const restore_hash = res.body.data.content.user.restore_hash;
                    const body = {
                        password: '654321',
                        confirmPassowrd: '654'
                    };

                    chai.request(server)
                        .post(`${this.BASE_URL}/users/change/${restore_hash}`)
                        .send(body)
                        .end((err, res) => {
                            res.should.have.status(422);
                            res.body.error.should.have.property('message').eql('Bad data for restoring password');
                            done();
                    });
            });
    };

    _authorizationChangedPasswordHandler(done) {
        const body = {
            login: 'an@codemotion.eu',
            password: '654321',
            device: 'mobile'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/login`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.user.should.be.a('object');
                res.body.data.content.user.should.have.property('token');
                res.body.data.content.user.should.have.property('status').eql('active');
                done();
        });
    };

    _authorizationOldPasswordHandler(done) {
        const body = {
            login: 'an@codemotion.eu',
            password: '123456'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/login`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(422);
                done();
        });
    };
}
const authorizationTestInstance = new AuthorizationTestMethods();
module.exports = authorizationTestInstance;




