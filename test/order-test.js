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

            // //GET All orders list
            // describe('GET orders list', () => {
            //     it('It should GET all orders by user token', this._getOrdersListHandler.bind(this));
            // });
            //
            // //Add credit card
            // describe('Create new credit card', () => {
            //     it('Should Add new card to user', this._addCreditCardHandler.bind(this));
            // });
            //
            // //Remove first credit card
            // describe('Delete first credit card(make status inactive)', () => {
            //     it('Should deactivate last card', this._removeCreditCardHandler.bind(this));
            // });

            //Create order
            describe('Create new order', () => {
                it('Should create a new order', this._createOrderHandler.bind(this));
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

    _addCreditCardHandler(done) {
        const cardIdx = 0;
        const newCC = {
            ccNumber: '4000100211112222',
            CVV: '999',
            expire: '09/19'
        };
        chai.request(server)
            .post(`${this.BASE_URL}/add-credit-card`)
            .send(newCC)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.user.credit_cards[cardIdx].should.be.a('object');
                res.body.data.content.user.credit_cards[cardIdx].active.eql('true');
                // res.should.have.status(200);
                // res.body.should.be.a('object');
                // res.body.should.have.property('errors');
                // res.body.errors.should.have.property('pages');
                // res.body.errors.pages.should.have.property('kind').eql('required');
                done();
            });
    };

    _removeCreditCardHandler(done) {
        const cardIdx = 0;

        chai.request(server)
            .delete(`${this.BASE_URL}/delete-card/${cardIdx}`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.user.credit_cards[cardIdx].should.be.a('object');
                res.body.data.content.user.credit_cards[cardIdx].should.have.property('active').eql(false);
                // res.body.should.have.property('errors');
                // res.body.errors.should.have.property('pages');
                // res.body.errors.pages.should.have.property('kind').eql('required');
                done();
            });
    };

    _createOrderHandler() {

        const machineID = 350;
        const body = {
            productIds: ['32773', '32774'],
            paymentMethod: 'esaePay',
            cardId: 1,
        };

        const itemId = 29007;

        chai.request(server)
            .post(`${this.BASE_URL}/product-order/${machineID}`)
            .send(body)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                console.log(err);
                console.log(res);
                // res.should.have.status(200);
                // res.body.data.content.user.credit_cards[cardIdx].should.be.a('object');
                // res.body.data.content.user.credit_cards[cardIdx].active.eql('true');
                // res.should.have.status(200);
                // res.body.should.be.a('object');
                // res.body.should.have.property('errors');
                // res.body.errors.should.have.property('pages');
                // res.body.errors.pages.should.have.property('kind').eql('required');
                done();
            });

    };

    _cancelOrderHandler() {

    };

    updateOrderHandler() {

    };

}
const orderTestMethods = new OrderTestMethods();
module.exports = orderTestMethods;



