const chai = require('chai')
    , chaiHttp = require('chai-http')
    , server = require('../app.js')
    , TransactionsModel = require('../app/models/transactions')
    , should = chai.should();

chai.use(chaiHttp);


class TransactionsTestMethods {

    constructor() {
        this.BASE_URL = '/api/v1';
        this.userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6InZAY29kZW1vdGlvbi5ldSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTI0MzY3NiwiZXhwIjoxNTA2MzQ3Njc2fQ.ovUjkoSA0NRX72Ia_rE8_c2-5cmYOrD2-OrVkRtHNJE';
        this.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6ImFkbWluQGdtYWlsLmNvbSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTIzNjE1MiwiZXhwIjoxNTA2MzQwMTUyfQ.YFc5oFaMXwT4n18F4GaxRXIQ5Fg7O5fLTU4eEc6_QwA';
    }

    runTests() {
        describe('Q&A', (...r) => {
            // GET All transactions list
            describe('GET transactions list', () => {
                it('It should GET all transactions list', this._getTransactionsListHandler.bind(this));
            });

            //Transactions - Add credit card 
            describe('POST add credit card', () => {
                it('It should POST and create new transactions', this._createTransactionAddCardHandler.bind(this));
            });

            //Transactions - Delete credit card 
            describe('DELETE credit card', () => {
                it('It should DELETE and delete credit card', this._deleteCardTransactionHandler.bind(this));
            });

            //Pay with credit card
            describe('POST make payment', () => {
                it('It should POST and pay with credit card', this._makePaymentHandler.bind(this));
            });

            //Update order status
            describe('PUT update order status', () => {
                it('It should UPDATE order status', this._updateOrderTransactionsHandler.bind(this));
            });

            //Cancel Order
            describe('GET cancel order', () => {
                it('It should cancel order', this._cancelOrderTransactionsHandler.bind(this));
            });

        });
    };

    _getTransactionsListHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/transactions-datatable`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.transactions.should.be.a('object');
                done();
            });
    };

    _createTransactionAddCardHandler(done) {
        const cardIdx = 0;
        const newCC = {
            ccNumber: '4000100111112223',
            CVV: '321',
            expire: '09/19'
        };

        chai.request(server)
            .post(`${this.BASE_URL}/add-credit-card`)
            .send(newCC)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });

        transactionsModel.list()
            .then((transactions) => {
                const lastTransaction = transactions[transactions.length - 1];
                        lastTransaction.should.have.property('status').eql('Approved');
                        lastTransaction.should.have.property('time_created');
                        lastTransaction.should.have.property('event').eql('Add Card');
            });
    };

    _deleteCardTransactionHandler(done) {
        const cardIdx = 0;

        chai.request(server)
            .delete(`${this.BASE_URL}/delete-card/${cardIdx}`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });

        transactionsModel.list()
            .then((transactions) => {
                const lastTransaction = transactions[transactions.length - 1];
                        lastTransaction.should.have.property('status').eql('Approved');
                        lastTransaction.should.have.property('time_created');
                        lastTransaction.should.have.property('event').eql('Delete Card');
            });
    };

    _makePaymentHandler(done) {
        const machineID = 350;
        const body = {
            productIds: ['32773', '32774', '32775'],
            paymentMethod: 'esaePay',
            cardId: 1,
        };

        chai.request(server)
            .post(`${this.BASE_URL}/pay-with-credit-card`)
            .send(body)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });

        transactionsModel.list()
            .then((transactions) => {
                const lastTransaction = transactions[transactions.length - 1];
                        lastTransaction.should.have.property('status').eql('Error');
                        lastTransaction.should.have.property('time_created');
                        lastTransaction.should.have.property('event').eql('UsaEpay Transaction');
                        lastTransaction.should.have.property('amount');
                        lastTransaction.should.have.property('orderId');
            });
    };

    _updateOrderTransactionsHandler(done) { 
        const orderId = 1;
        const body = {
            status: 'picked_up'
        }

        chai.request(server)
            .put(`${this.BASE_URL}/order/${orderId}`)
            .send(body)
            .set('x-access-token', this.token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });

        transactionsModel.list()
            .then((transactions) => {
                const lastTransaction = transactions[transactions.length - 1];
                        lastTransaction.should.have.property('status').eql('picked_up');
                        lastTransaction.should.have.property('time_created');
                        lastTransaction.should.have.property('event').eql('Update Order Status');
                        lastTransaction.should.have.property('orderId');
            });
    };

    _cancelOrderTransactionsHandler(done) {
        const machineID = 350;
        const orderId = 1;

        chai.request(server)
            .get(`${this.BASE_URL}/product-order-cancel/${machineID}/${orderId}`)
            .set('x-access-token', this.userToken)
            .end((err, res) => {
                console.log(err);
                console.log(res);
                res.should.have.status(200);
                res.body.data.content.result.should.be.a('object');
                res.body.data.content.result.should.have.property('status').eql('Canceled');
                done();
            });

        transactionsModel.list()
            .then((transactions) => {
                const lastTransaction = transactions[transactions.length - 1];
                        lastTransaction.should.have.property('status').eql('Canceled');
                        lastTransaction.should.have.property('time_created');
                        lastTransaction.should.have.property('event').eql('Cancel Order');
                        lastTransaction.should.have.property('orderId');
            });

    };
}
const transactionsTestInstance = new TransactionsTestMethods();
module.exports = transactionsTestInstance;




