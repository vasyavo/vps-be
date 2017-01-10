const chai = require('chai')
    , chaiHttp = require('chai-http')
    , server = require('../app.js')
    , userModel = require('../app/models/user')
    , should = chai.should();

chai.use(chaiHttp);


class AuthorizationTestMethods {

    constructor() {
        this.BASE_URL = '/api/v1'
        };
    }

    runTests() {
        describe('Q&A', (...r) => {

            // Registration by using wrong data
            describe('POST user registers by using wrong data', () => {
                it('It should POST and user registers by using wrong data', this._registrationWrongDataHandler.bind(this));
            });

            // Registration by using correct data
            describe('POST user registers', () => {
                it('It should POST and user registers', this._registrationCorrectDataHandler.bind(this));
            });

            // Registration by registered user
            describe('POST registered user registers', () => {
                it('It should POST and registered user registers', this._registrationRegisteredUserHandler.bind(this));
            });

            // Confirm registration by using wrong token
            describe('GET confirm registration by using wrong token', () => {
                it('It should GET confirm registration by using wrong token', this._confirmRegistrationWrongTokenHandler.bind(this));
            });

            // Confirm registration
            describe('GET confirm registration', () => {
                it('It should GET confirm registration', this._confirmRegistrationHandler.bind(this));
            });

            // Authorization by using wrong data
            describe('POST authorization by using wrong data', () => {
                it('It should authorization by using wrong data', this._authorizationWrongDataHandler.bind(this));
            });

            // Authorization by User
            describe('POST authorization by User', () => {
                it('It should authorization by User', this._authorizationUserHandler.bind(this));
            });

        });
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
                res.body.should.be.a('object');
                res.body.data.should.have.property('message').eql('Incorrect info for registration');
                done();
        });
    };

    _registrationCorrectDataHandler(done) {
        const body = {
            login: 'an@codemotion.eu',
            password: '123456'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/register`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.data.should.have.property('message').eql('Account successfully created');
                done();
        });

    _registrationRegisteredUserHandler(done) {
        const body = {
            login: 'an@codemotion.eu',
            password: '123456'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/register`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(422);
                res.body.should.be.a('object');
                done();
        });

    _confirmRegistrationWrongTokenHandler(done) {
        const confirm_hash = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6ImFkbWluQGdtYWlsLmNvbSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTIzNjE1MiwiZXhwIjoxNTA2MzQwMTUyfQ.YFc5oFaMXwT4n18F4GaxRXIQ5Fg7O5fLTU4eEc6_Qwb';

        chai.request(server)
            .get(`${this.BASE_URL}/users/register/confirm_hash`)
            .end((err, res) => {
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.data.should.have.property('message').eql('Incorrect hash params');
                done();
        });

    _confirmRegistrationHandler(done) {
        userModel.hash()
            .then((confirm_hash) => {

            chai.request(server)
                .get(`${this.BASE_URL}/users/register/${confirm_hash}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.data.should.have.property('message').eql('Successfully activated.');
                    done();
            });
        });

    _authorizationWrongDataHandler(done) {
        const body = {
            login: 'an@codemotion',
            password: '123'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/login`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.data.should.have.property('message').eql('Incorrect info for authenticate');
                done();
        });

    _authorizationUserHandler(done) {
        const body = {
            login: 'an@codemotion.eu',
            password: '123456',
            device: '',
            tokenDevice: ''
        };

        chai.request(server)
            .post(`${this.BASE_URL}/users/login`)
            .send(body)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.data.content.user.should.have.property('token');
                //res.body.data.content.user.should.have.property('tokenDevice');
                //res.body.data.content.user.should.have.property('device');
                done();
        });

    };
}
const questionTestInstance = new QuestionsTestMethods();
module.exports = questionTestInstance;




