const chai = require('chai')
    , chaiHttp = require('chai-http')
    , server = require('../app.js')
    , commentModel = require('../app/models/comment')
    , should = chai.should();

chai.use(chaiHttp);


class CommentsTestMethods {

    constructor() {
        this.BASE_URL = '/api/v1';
        this.newComment = {
            title: 'Comment Title',
            text: 'Comment Text',
            item_name: 'Sumo BBQ'
            };
        this.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbiI6ImFkbWluQGdtYWlsLmNvbSIsInN0YXR1cyI6ImFjdGl2ZSIsImV4cGlyZSI6MzExMDQwMDAsImlhdCI6MTQ3NTIzNjE1MiwiZXhwIjoxNTA2MzQwMTUyfQ.YFc5oFaMXwT4n18F4GaxRXIQ5Fg7O5fLTU4eEc6_QwA'
    }

    runTests() {
        describe('Q&A', (...r) => {
            // GET All comments list for Admin
            describe('GET comments list for Admin', () => {
                it('It should GET all the comments', this._getCommentsListForAdminHandler.bind(this));
            });
            // GET All comments list for User
            describe('GET comments list for User', () => {
                it('It should GET all the comments', this._getCommentsListForUserHandler.bind(this));
            });
            // GET Comment for Admin
            describe('GET comment for Admin', () => {
                it('It should GET the comment', this._getCommentForAdminHandler.bind(this));
            });
            //Create new comment
            describe('POST create comment', () => {
                it('It should POST and create new comment', this._createCommentHandler.bind(this));
            });

            //Delete comment
            describe('DELETE comment', () => {
                it('It should DELETE created comment', this._deleteCommentHandler.bind(this));
            });

            //Update comment
            describe('PUT comment', () => {
                it('It should UPDATE comment', this._updateCommentHandler.bind(this));
            });

        });
    };

    _getCommentsListForAdminHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/comments-datatable`)
            .set('x-access-token', this.token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.comment.should.be.a('array');
                done();
            });
    };

    _getCommentsListForUserHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/comments`)
            .set('x-access-token', this.token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.comment.should.be.a('array');
                done();
            });
    };

    _getCommentForAdminHandler(done) {
        chai.request(server)
            .get(`${this.BASE_URL}/comment/2`)
            .set('x-access-token', this.token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.data.content.comment.should.be.a('object');
                done();
            });
    };

    _createCommentHandler(done) {

        chai.request(server)
            .post(`${this.BASE_URL}/comments/1`)
            .send(this.newComment)
            .set('x-access-token', this.token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.data.should.have.property('message').eql('Thanks for your comment. Its under review.');
                res.body.data.content.comment.should.have.property('status').eql(false);
                done();
            });
    };

    _deleteCommentHandler(done) {
        commentModel.create(this.newComment)
            .then((comment) => {
                chai.request(server)
                    .delete(`${this.BASE_URL}/comments/${comment._id}`)
                    .set('x-access-token', this.token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.data.should.have.property('message').eql('Comment successfully deleted');
                        done();
                    });
            })
            .catch();
    };

    _updateCommentHandler(done) {
        commentModel.create(this.newComment)
            .then((comment) => {
                chai.request(server)
                    .put(`${this.BASE_URL}/comments/${comment._id}`)
                    .send({
                       title: 'Updated Comment Title',
                       text: 'Updated Comment Text',
                       item_name: 'Sumo BBQ'   
                    })
                    .set('x-access-token', this.token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.data.content.comment.should.have.property('title').eql('Updated Comment Title');
                        res.body.data.content.comment.should.have.property('text').eql('Updated Comment Text');
                        done();
                    });
            })
            .catch();
    };
}
const commentTestInstance = new CommentsTestMethods();
module.exports = commentTestInstance;




