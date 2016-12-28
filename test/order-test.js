const chai = require('chai')
    , chaiHttp = require('chai-http')
    , server = require('../app.js')
    , QuestionsModel = require('../app/models/questions')
    , should = chai.should();

chai.use(chaiHttp);


class OrderTestMethods {

    constructor() {
        this.BASE_URL = '/api/v1';
        this.newQuestion = {
            question: 'My first question',
            answer: 'My first answer'
        };
        this.userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6InZAY29kZW1vdGlvbi5ldSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTI0MzY3NiwiZXhwIjoxNTA2MzQ3Njc2fQ.ovUjkoSA0NRX72Ia_rE8_c2-5cmYOrD2-OrVkRtHNJE';
    };

    runTests() {
        describe('Orders', () => {

            //GET All orders list
            describe('GET orders list', () => {
                it('It should GET all orders by user token', this._getOrdersListHandler.bind(this));
            });
            //Create new order
            //Cancel order
            //Update order

        });
    };

    _getOrdersListHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/orders-list`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.orders.should.be.a('array');
                done();
            });
    };

    _createOrderHandler() {

    };

    _cancelOrderHandler() {

    };

    updateOrderHandler() {

    };

}
const orderTestMethods = new OrderTestMethods();
module.exports = orderTestMethods;




