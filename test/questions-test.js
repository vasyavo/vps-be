const chai = require('chai')
    , chaiHttp = require('chai-http')
    , server = require('../app.js')
    , QuestionsModel = require('../app/models/questions')
    , should = chai.should();

chai.use(chaiHttp);


class QuestionsTestMethods {

    constructor() {
        this.BASE_URL = '/api/v1';
        this.newQuestion = {
            question: 'My first question',
            answer: 'My first answer'
        };
    }

    runTests() {
        // describe('Q&A', (...r) => {
        //     // GET All questions list
        //     describe('GET questions list', () => {
        //         it('It should GET all the books', this._getQuestionsListHandler.bind(this));
        //     });
        //
        //     //Create new question
        //     describe('POST create question', () => {
        //         it('It should POST and create new question', this._createQuestionHandler.bind(this));
        //     });
        //
        //     //Delete question
        //     describe('DELETE question', () => {
        //         it('It should DELETE created question', this._deleteQuestionHandler.bind(this));
        //     });
        //
        //     //Update question
        //     describe('PUT question', () => {
        //         it('It should UPDATE question and answer to My second question and My second answer', this._updateQuestionHandler.bind(this));
        //     });
        //
        // });
    };

    _getQuestionsListHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/questions`)
            .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6InZAY29kZW1vdGlvbi5ldSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTI0MzY3NiwiZXhwIjoxNTA2MzQ3Njc2fQ.ovUjkoSA0NRX72Ia_rE8_c2-5cmYOrD2-OrVkRtHNJE')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.question.should.be.a('array');
                done();
            });
    };

    _createQuestionHandler(done) {

        chai.request(server)
            .post(`${this.BASE_URL}/questions`)
            .send(this.newQuestion)
            .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6InZAY29kZW1vdGlvbi5ldSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTI0MzY3NiwiZXhwIjoxNTA2MzQ3Njc2fQ.ovUjkoSA0NRX72Ia_rE8_c2-5cmYOrD2-OrVkRtHNJE')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('pages');
                res.body.errors.pages.should.have.property('kind').eql('required');
                done();
            });
    };

    _deleteQuestionHandler(done) {
        QuestionsModel.create(this.newQuestion)
            .then((question) => {
                chai.request(server)
                    .delete(`${this.BASE_URL}/questions/${question._id}`)
                    .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6InZAY29kZW1vdGlvbi5ldSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTI0MzY3NiwiZXhwIjoxNTA2MzQ3Njc2fQ.ovUjkoSA0NRX72Ia_rE8_c2-5cmYOrD2-OrVkRtHNJE')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('errors');
                        res.body.errors.should.have.property('pages');
                        res.body.errors.pages.should.have.property('kind').eql('required');
                        done();
                    });
            })
            .catch();
    };

    _updateQuestionHandler(done) {
        QuestionsModel.create(this.newQuestion)
            .then((question) => {
                chai.request(server)
                    .put(`${this.BASE_URL}/questions/${question._id}`)
                    .send({question: 'My second question', answer: 'My second answer'})
                    .set('x-access-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6InZAY29kZW1vdGlvbi5ldSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTI0MzY3NiwiZXhwIjoxNTA2MzQ3Njc2fQ.ovUjkoSA0NRX72Ia_rE8_c2-5cmYOrD2-OrVkRtHNJE')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('errors');
                        res.body.errors.should.have.property('pages');
                        res.body.errors.pages.should.have.property('kind').eql('required');
                        done();
                    });
            })
            .catch();
    };
}
const questionTestInstance = new QuestionsTestMethods();
module.exports = questionTestInstance;




