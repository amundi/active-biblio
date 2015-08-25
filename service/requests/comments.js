var response = require('../response');
var util = require('../util');
var models = require('../database/models');

var Comment = models.Comment;
var Account = models.Account;

function create(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        comment_text: req.body.comment_text
    };

    var numeric_parameters = {
        account_id: parameters['account_id'],
        book_id: parameters['book_id']
    };

    if (util.check_undefined_parameters(res, parameters)) {
        if (util.check_nan_parameters(res, numeric_parameters)) {
            Comment.create(parameters)
                .then(function (insert_result) {
                    response.send_success(res, insert_result.dataValues, response.query_action.INSERT);
                }).catch(function () {
                    response.send_error(res, "Couldn't add this comment");
                });
        }
    }
}

function delete_comment(req, res) {
    var parameters = {
        comment_id: req.params.comment_id,
        book_id: req.params.id
    };

    if (util.check_nan_parameters(res, parameters)) {
        Comment.destroy({
            where: {
                id: parameters['comment_id'],
                book_id: parameters['book_id']
            }
        })
            .then(function (delete_result) {
                response.send_success(res, delete_result, response.query_action.DELETE);
            })
            .catch(function () {
                response.send_error(res, "Couldn't delete this location");
            });
    }
}

function get_book_comments(req, res) {
    var value = {
        book_id: req.params.id
    };

    if (util.check_nan_parameters(res, value)) {
        Comment.findAll({
            where: {
                book_id: value['book_id']
            },
            attributes: ['id', 'book_id', 'comment_date', 'comment_text'],
            include: [{
                model: Account,
                attributes: ['id', 'email']
            }]
        })
            .then(function (comments) {
                response.send_success(res, comments, response.query_action.SELECT);
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

exports.create = create;
exports.delete_comment = delete_comment;
exports.get_book_comments = get_book_comments;