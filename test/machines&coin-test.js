const chai = require('chai')
    , chaiHttp = require('chai-http')
    , server = require('../app.js')
    , machinesModel= require('../app/models/machines')
    , achinesImagesModel = require('../app/models/machines/machinesImages')
    , should = chai.should();

chai.use(chaiHttp);


class MachinesTestMethods {

    constructor() {
        this.BASE_URL = '/api/v1';
        this.userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6InZAY29kZW1vdGlvbi5ldSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTI0MzY3NiwiZXhwIjoxNTA2MzQ3Njc2fQ.ovUjkoSA0NRX72Ia_rE8_c2-5cmYOrD2-OrVkRtHNJE';
    }

    runTests() {
        describe('Products list', (...r) => {
            // GET All machines list
            describe('GET machines list', () => {
                it('It should GET machines list', this._getMachinesListHandler.bind(this));
            });

            // GET machine
            describe('GET machine', () => {
                it('It should GET machine', this._getMachineHandler.bind(this));
            });

            // // Coins sharing
            describe('POST add sharing bonuses', () => {
                it('It should add sharing bonuses', this._coinsSharingHandler.bind(this));
            });
        });
    };

    _getMachinesListHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/machines`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.machines.should.be.a('array');
                done();
            });
    };

    _getMachineHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/machine/350`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.result.should.be.a('object');
                done();
            });
    };

    _coinsSharingHandler(done) {
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
            
                const userId = res.body.data.content.user._id;
                const token = res.body.data.content.user.token[0];

                chai.request(server)
                    .post(`${this.BASE_URL}/coin-sharing/${userId}`)
                    .send()
                    .set('x-access-token', token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.data.content.user.should.be.a('object');
                        res.body.data.should.have.property('message').eql('Bonus coins added');
                        done();
                });
        });
    };

}
const machinesTestInstance = new MachinesTestMethods();
module.exports = machinesTestInstance;




