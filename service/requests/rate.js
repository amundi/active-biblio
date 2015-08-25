var response = require('../response');
var util = require('../util');
var models = require('../database/models');

var Rate = models.Rate;

// User can rate the book
// If the rate doesn't exist, we create one for this user
// Else we update the rate
function put(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        mark: req.body.mark
    };

    if (util.check_nan_parameters(res, parameters)) {
        Rate.findAll({
            where: {
                account_id: parameters['account_id'],
                book_id: parameters['book_id']
            }
        })
            .then(function (rates) {
                if (rates.length == 0) {
                    Rate.create(parameters)
                        .then(function (insert_result) {
                            response.send_success(res, insert_result.dataValues, response.query_action.INSERT);
                        }).catch(function () {
                            response.send_error(res, "Couldn't add this rate");
                        });
                }
                else {
                    Rate.update({
                        mark: parameters['mark']
                    }, {
                        where: {
                            account_id: parameters['account_id'],
                            book_id: parameters['book_id']
                        }
                    })
                        .then(function (update_result) {
                            response.send_success(res, update_result, response.query_action.UPDATE);
                        })
                        .catch(function () {
                            response.send_error(res, "Couldn't update this rate");
                        });
                }
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

// Return one db row if user connected has rated this book
function get_account_rate(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id
    };

    if (util.check_nan_parameters(res, parameters)) {
        Rate.findAll({
            where: parameters
        })
            .then(function (rates) {
                response.send_success(res, rates, response.query_action.SELECT);
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

exports.put = put;
exports.get_account_rate = get_account_rate;