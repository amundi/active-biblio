var database = require('../database/connection');
var response = require('../response');
var util = require('../util');
var models = require('../database/models');

var sequelize = database.sequelize;
var Vote = models.Vote;
var Book = models.Book;
var Author = models.Author;

var VOTETYPE_FAVORITE = 2;

function create(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        votetype_id: VOTETYPE_FAVORITE
    };

    if (util.check_nan_parameters(res, parameters)) {
        Vote.create(parameters)
            .then(function (insert_result) {
                response.send_success(res, insert_result.dataValues, response.query_action.INSERT);
            }).catch(function () {
                response.send_error(res, "Couldn't add this book to favorite");
            });
    }
}

function delete_favorite(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        votetype_id: VOTETYPE_FAVORITE
    };

    if (util.check_nan_parameters(res, parameters)) {
        Vote.destroy({
            where: parameters
        })
            .then(function (delete_result) {
                response.send_success(res, delete_result, response.query_action.DELETE);
            })
            .catch(function () {
                response.send_error(res, "Couldn't delete this book from favorite");
            });
    }
}

// Return favorites for a user
function get_account_favorites(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        votetype_id: VOTETYPE_FAVORITE
    };

    if (util.check_nan_parameters(res, parameters)) {
        Vote.findAll({
            where: parameters,
            attributes: ['id', 'votetype_id', 'added_date'],
            include: [{
                model: Book,
                attributes: ['id', 'title'],
                include: [{
                    model: Author,
                    attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.literal("DISTINCT `Book.Authors`.`name`")), 'name']]
                }]
            }],
            group: 'Vote.id'
        })
            .then(function (favorites) {
                response.send_success(res, favorites, response.query_action.SELECT);
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

// Return one db row if user connected has added this book to favorite
function get_account_favorite_book(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        votetype_id: VOTETYPE_FAVORITE
    };

    if (util.check_nan_parameters(res, parameters)) {
        Vote.findAll({
            where: parameters
        })
            .then(function (favorites) {
                response.send_success(res, favorites, response.query_action.SELECT);
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

exports.create = create;
exports.delete_favorite = delete_favorite;
exports.get_account_favorites = get_account_favorites;
exports.get_account_favorite_book = get_account_favorite_book;