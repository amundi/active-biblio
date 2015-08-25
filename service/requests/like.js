var response = require('../response');
var util = require('../util');
var models = require('../database/models');

var Vote = models.Vote;

var VOTETYPE_LIKE = 1;

function create(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        votetype_id: VOTETYPE_LIKE
    };

    if (util.check_nan_parameters(res, parameters)) {
        Vote.create(parameters)
            .then(function (insert_result) {
                response.send_success(res, insert_result.dataValues, response.query_action.INSERT);
            }).catch(function () {
                response.send_error(res, "Couldn't like this book");
            });
    }
}

function delete_like(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        votetype_id: VOTETYPE_LIKE
    };

    if (util.check_nan_parameters(res, parameters)) {
        Vote.destroy({
            where: parameters
        })
            .then(function (delete_result) {
                response.send_success(res, delete_result, response.query_action.DELETE);
            })
            .catch(function () {
                response.send_error(res, "Couldn't dislike this book");
            });
    }
}

// Return one db row if user connected has liked this book
function get_account_like(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        votetype_id: VOTETYPE_LIKE
    };

    if (util.check_nan_parameters(res, parameters)) {
        Vote.findAll({
            where: parameters
        })
            .then(function (likes) {
                response.send_success(res, likes, response.query_action.SELECT);
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

exports.create = create;
exports.delete_like = delete_like;
exports.get_account_like = get_account_like;