const chai = require('chai')
    , chaiHttp = require('chai-http')
    , server = require('../app.js')
    , transactionsModel = require('../app/models/transactions')
    , should = chai.should();

chai.use(chaiHttp);


class OrderTestMethods {

    constructor() {
        this.BASE_URL = '/api/v1';
        this.userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6ImFkbWluQGdtYWlsLmNvbSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTIzNjE1MiwiZXhwIjoxNTA2MzQwMTUyfQ.YFc5oFaMXwT4n18F4GaxRXIQ5Fg7O5fLTU4eEc6_QwA';
        this.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6ImFkbWluQGdtYWlsLmNvbSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTIzNjE1MiwiZXhwIjoxNTA2MzQwMTUyfQ.YFc5oFaMXwT4n18F4GaxRXIQ5Fg7O5fLTU4eEc6_QwA';
    }

    runTests() {
        // describe('Orders', () => {
        //
        //     //Add credit card
        //     describe('Add new credit card', () => {
        //          it('Should add new card to user', this._addCreditCardHandler.bind(this));
        //     });
        //
        //     //Add credit card with wrong CVV by User
        //     describe('Add credit card with wrong CVV', () => {
        //          it('Should Add card with Wrong CVV by user', this._addCreditCardWrongCVVHandler.bind(this));
        //     });
        //
        //     //Add existing in the system credit card
        //     describe('Add credit card that already exists in the system', () => {
        //          it('Should Add card that already exists in the system', this._addExistingCreditCardHandler.bind(this));
        //     });
        //
        //     //Add Pickup Card
        //     describe('Add credit card that was lost', () => {
        //          it('Should Add card that was lost', this._addPickupCreditCardHandler.bind(this));
        //     });
        //
        //     //Add Declined Card
        //     describe('Add credit card that was declined', () => {
        //          it('Should Add card that was declined', this._addDeclinedCreditCardHandler.bind(this));
        //     });
        //
        //     //Create order
        //     describe('Create new order', () => {
        //         it('Should create a new order', this._createOrderHandler.bind(this));
        //     });
        //
        //     //Get Order status
        //     describe('Get order status', () => {
        //         it('Should get order status', this._getOrderStatusHandler.bind(this));
        //     });
        //
        //     //Update Order status
        //     describe('Update order status', () => {
        //         it('Should update order status', this._updateOrderHandler.bind(this));
        //     });
        //
        //     // GET All orders list
        //     describe('GET orders list', () => {
        //          it('It should GET all orders by user token', this._getOrdersListHandler.bind(this));
        //     });
        //
        //     //Cancel order
        //     describe('Cancel existing order', () => {
        //         it('Should cancel existing order', this._cancelOrderHandler.bind(this));
        //     });
        //
        //      //Remove added credit card
        //     describe('Delete credit card(make status inactive)', () => {
        //          it('Should deactivate last card', this._removeCreditCardHandler.bind(this));
        //     });
        //
        //     //Add removed credit card
        //     describe('Add removed credit card)', () => {
        //          it('Should add removed credit card', this._AddRemovedCreditCardHandler.bind(this));
        //     });
        // });
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
                res.body.data.content.user.credit_cards[res.body.data.content.user.credit_cards.length - 1].should.be.a('object');
                res.body.data.content.user.credit_cards[res.body.data.content.user.credit_cards.length - 1].active.eql('true');
                done();
            });
    };

    _addCreditCardWrongCVVHandler(done) {
        const cardIdx = 0;
        const newCC = {
            ccNumber: '4000301311112225',
            CVV: '999',
            expire: '09/19'
        };
        chai.request(server)
            .post(`${this.BASE_URL}/add-credit-card`)
            .send(newCC)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(422);
                res.body.data.should.have.property('message').eql('Wrong Card Information.');
                done();
            });     
    };

    _addExistingCreditCardHandler(done) {
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
                res.should.have.status(422);
                res.body.data.should.have.property('message').eql('Card already added.');
                done();
            });     
    };

    _addPickupCreditCardHandler(done) {
        const cardIdx = 0;
        const newCC = {
            ccNumber: '4000300001112222',
            CVV: '999',
            expire: '09/19'
        };
        chai.request(server)
            .post(`${this.BASE_URL}/add-credit-card`)
            .send(newCC)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            });     
    };

    _addDeclinedCreditCardHandler(done) {
        const cardIdx = 0;
        const newCC = {
            ccNumber: '4000300011112220',
            CVV: '999',
            expire: '09/19'
        };
        chai.request(server)
            .post(`${this.BASE_URL}/add-credit-card`)
            .send(newCC)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(422);
                //res.body.data.should.have.property('message').eql('Wrong Card Information.');
                done();
            });     
    };

    _createOrderHandler(done) {

        const machineID = 350;
        const body = {
            productIds: ['32773', '32774'],
            paymentMethod: 'esaePay',
            cardId: 1,
        };

        //const itemId = 29007;

        chai.request(server)
            .post(`${this.BASE_URL}/product-order/${machineID}`)
            .send(body)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.result.should.be.a('object');
                res.body.data.content.result.should.have.property('orderId');
                res.body.data.content.result.should.have.property('itemId');
                done();
            });

    };

    _getOrderStatusHandler(done) {

        const machineID = 350;
        const orderId = 0;

        chai.request(server)
            .get(`${this.BASE_URL}/product-order-status/${machineID}/${orderId}`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.result.should.be.a('object');
                res.body.data.content.result.should.have.property('${orderId}');
                res.body.data.content.result.should.have.property('status').eql('pending');
                done();
            });

    };

    _updateOrderHandler(done) {
        const machineID = 350;
        const orderId = 0;
        const body = {
            status: 'picked_up'
        };

        chai.request(server)
            .put(`${this.BASE_URL}/order/${orderId}`)
            .send(body)
            .set('x-access-token', this.token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.result.should.be.a('object');
                res.body.data.content.result.should.have.property('status').eql('picked_up');
                done();
            });
    };

    _getOrdersListHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/orders-list`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.orders.should.be.a('array');
                res.body.data.content.result.should.have.property('orderId');
                done();
            });
    };

    _cancelOrderHandler(done) {
        const machineID = 350;
        const orderId = 1;

        chai.request(server)
            .get(`${this.BASE_URL}/product-order-cancel/${machineID}/${orderId}`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.result.should.be.a('object');
                res.body.data.content.result.should.have.property('status').eql('Canceled');
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
                res.body.data.content.user.credit_cards[res.body.data.content.user.credit_cards.length - 1].should.be.a('object');
                res.body.data.content.user.credit_cards[res.body.data.content.user.credit_cards.length - 1].should.have.property('active').eql(false);
                res.body.data.should.have.property('message').eql('Card successfully deleted');
                done();
            });
    };

    _AddRemovedCreditCardHandler(done) {
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
                res.body.data.content.user.credit_cards[res.body.data.content.user.credit_cards.length - 1].should.be.a('object');
                res.body.data.content.user.credit_cards[res.body.data.content.user.credit_cards.length - 1].active.eql('true');
                done();
            });
    };

}
const orderTestMethods = new OrderTestMethods();
module.exports = orderTestMethods;



