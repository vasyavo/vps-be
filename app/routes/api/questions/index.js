const fs = require('fs')
    , path = require('path')
    , questionsModels = require(__dirname + '/../../../models/questions')
    , helperFunctions = require(__dirname + '/../../../models/helpers');


/**
 * Questions routes class.
 * @constructor
 */

class QuestionsRoutes {
    constructor() {};


    /**
     * Create question handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    createQuestionHandler(req, res, next) {
        const questionData = {
            question: req.body.question,
            answer: req.body.answer,
            status: true
        };

        if (!questionData.question || !questionData.answer) {
            helperFunctions.generateResponse(422, 'Incorrect info for creating question', null, null, res);
            return;
        }

        questionsModels.create(questionData)
            .then((question) => {
                helperFunctions.generateResponse(200, null, {question: question}, 'Question successfully created!', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Get question handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    getQuestionsHandler(req, res, next) {
        let itemId = req.params.itemId || null;
        let findOptions = {};

        if (itemId) findOptions['_id'] = itemId;

        questionsModels.list(findOptions)
            .then((question) => {
                helperFunctions.generateResponse(200, null, {question: question}, '', res);
            })
            .catch((err) => {
                console.log(err);
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Update question handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    updateQuestionHandler(req, res, next) {
        let questionId = req.params.id || null;
        let questionBody = req.body || {};

        if (!questionId || !Object.keys(questionBody).length) {
            helperFunctions.generateResponse(422, 'Incorrect info for updating question', null, null, res);
            return;
        }

        questionsModels.update({_id: questionId}, questionBody)
            .then((question) => {
                helperFunctions.generateResponse(200, null, {question: question}, 'Question status successfully changed', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


    /**
     * Delete question handler
     * @param {object} req - request
     * @param {object} res - response
     * @param {function} next - next route
     */

    deleteQuestionHandler(req, res, next) {
        let questionId = req.params.id || null;

        if (!questionId) {
            helperFunctions.generateResponse(422, 'Incorrect info for deleting question', null, null, res);
            return;
        }

        questionsModels.delete({_id: questionId})
            .then(() => {
                helperFunctions.generateResponse(200, null, {}, 'Question successfully deleted', res);
            })
            .catch((err) => {
                helperFunctions.generateResponse(422, err, null, null, res);
            });
    }


}

const questionsRoutes = new QuestionsRoutes();

module.exports = questionsRoutes;
