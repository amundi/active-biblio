var database = require('../database/connection');
var response = require('../response');
var util = require('../util');
var _ = require('underscore');
var books = require('./books');
var models = require('../database/models');
var config = require('../config');
var reservations = require('./reservations');

var sequelize = database.sequelize;
var Hardcopy = models.Hardcopy;
var Book = models.Book;
var Author = models.Author;
var Category = models.Category;
var Location = models.Location;
var Account = models.Account;
var Rental = models.Rental;

// Request to select book with a specific id
function get_specific_hardcopy(req, res) {
    var value = {
        id: req.params.id
    };

    if (util.check_nan_parameters(res, value)) {
        select_hardcopy_query(null, null, null, value, res);
    }
}

// 2 functionning :
// - The book already exists: we create the hardcopy with book id
// - The book doesn't exist: we create the book, authors, categories and after that
// we create the hardcopy
function create(req, res) {
    var numeric_parameters = {
        isbn10: req.body.isbn10,
        isbn13: req.body.isbn13,
        published_date: req.body.published_date,
        pages: req.body.pages,
        location_id: req.body.location_id
    };

    var textual_parameters = {
        title: req.body.title,
        language: req.body.language
    };

    var param_optional = {
        publisher: req.body.publisher,
        description: req.body.description,
        photo: req.body.photo
    };

    var book_id = 0;
    var hardcopy_id = 0;

    if (util.check_nan_parameters(res, numeric_parameters)
        && util.check_undefined_parameters(res, textual_parameters)) {

        _.each(param_optional, function (value, key) {
            value ? textual_parameters[key] = value : value;
        });

        var categories = req.body.category ? _.flatten(new Array(req.body.category)) : undefined;
        var authors = req.body.author ? _.flatten(new Array(req.body.author)) : undefined;

        if (numeric_parameters['isbn10'].length != 10) {
            response.send_error(res, "ISBN10 length mismatch");
        }
        else if (numeric_parameters['isbn13'].length != 13) {
            response.send_error(res, "ISBN13 length mismatch");
        }
        else if (!authors || authors.length == 0) {
            response.send_error(res, "This book doesn't have an author");
        }
        else {
            var parameters = textual_parameters;
            parameters['isbn10'] = numeric_parameters['isbn10'];
            parameters['isbn13'] = numeric_parameters['isbn13'];
            parameters['published_date'] = numeric_parameters['published_date'];
            parameters['pages'] = numeric_parameters['pages'];
            parameters['rental_days_limit'] = config.rental_delay;

            return sequelize.transaction(function (t) {
                return Book.findAll({
                    where: {
                        isbn10: parameters['isbn10'],
                        isbn13: parameters['isbn13']
                    }, transaction: t
                }).then(function (books_result) {
                    if (books_result.length == 0) {
                        return Book.create(parameters, {transaction: t}).then(function (book) {
                            book_id = book.id;
                            return Author.bulkCreate(
                                books.insert_author_query(book_id, authors),
                                {transaction: t}).then(function () {
                                    return Category.bulkCreate(
                                        books.insert_category_query(book_id, categories),
                                        {transaction: t}).then(function () {
                                            return Hardcopy.create({
                                                book_id: book_id,
                                                account_id: req.account_logged.id,
                                                location_id: numeric_parameters['location_id']
                                            }, {transaction: t}).then(function (hardcopy) {
                                                hardcopy_id = hardcopy.id;
                                            });
                                        });
                                });
                        });
                    }
                    else {
                        book_id = books_result[0].id;
                        return Hardcopy.create({
                            book_id: book_id,
                            account_id: req.account_logged.id,
                            location_id: numeric_parameters['location_id']
                        }, {transaction: t}).then(function (hardcopy) {
                            hardcopy_id = hardcopy.id;
                        });
                    }
                });
            })
                .then(function () {
                    //Assign new hardcopy to the reservation if someone has reserved this book
                    update_reservation_added_hardcopy(res, book_id, hardcopy_id, numeric_parameters['location_id']);
                }).catch(function () {
                    response.send_error(res, "Couldn't add this hardcopy");
                });
        }
    }
}

// For hardcopies, we can update location and state
function update(req, res) {
    var parameters = {
        id: req.params.id,
        location_id: req.body.location_id
    };

    if (util.check_nan_parameters(res, parameters)) {
        parameters['state'] = req.body.state;

        if (parameters['state']) {
            Hardcopy.update({
                location_id: parameters['location_id'],
                state: parameters['state']
            }, {
                where: {
                    id: parameters['id']
                }
            })
                .then(function (update_result) {
                    response.send_success(res, update_result, response.query_action.UPDATE);
                })
                .catch(function () {
                    response.send_error(res, "Couldn't update this hardcopy");
                });
        }
        else {
            response.send_error(res, "State is missing");
        }
    }
}

function delete_hardcopy(req, res) {
    var parameters = {
        id: req.params.id
    };

    if (util.check_nan_parameters(res, parameters)) {
        Hardcopy.destroy({
            where: parameters
        })
            .then(function (delete_result) {
                response.send_success(res, delete_result, response.query_action.DELETE);
            })
            .catch(function () {
                response.send_error(res, "Couldn't delete this hardcopy");
            });
    }
}

// Return list of hardcopies added by the user connected
function get_account_hardcopies(req, res) {
    var value = {
        account_id: req.account_logged.id
    };

    if (util.check_nan_parameters(res, value)) {
        select_hardcopy_query(null, null, null, value, res);
    }
}

function get_hardcopies_available(req, res) {
    var value = {
        book_id: req.params.id
    };

    if (util.check_nan_parameters(res, value)) {
        select_hardcopy_available(res, value, function (select_result) {
            if (!select_result) {
                response.send_success(res, select_result, response.query_action.SELECT);
            }
        });
    }
}

// Same functionning than book + search by location, owner and state
function search(req, res) {
    var numeric_parameters_book = {
        isbn10: req.query.isbn10,
        isbn13: req.query.isbn13,
        published_date: req.query.published_date,
        pages: req.query.pages,
        rental_days_limit: req.query.rental_days_limit
    };

    var textual_parameters_book = {
        title: req.query.title,
        language: req.query.language,
        publisher: req.query.publisher,
        description: req.query.description,
        author: req.query.author ? _.flatten(new Array(req.query.author)) : undefined,
        category: req.query.category ? _.flatten(new Array(req.query.category)) : undefined
    };

    var parameters_hardcopy = {
        account_id: req.query.account_id,
        location_id: req.query.location_id,
        state: req.query.state
    };

    var query_condition = books.search_query_construction(textual_parameters_book, numeric_parameters_book);
    var hardcopy_condition = {};

    _.each(parameters_hardcopy, function (value, key) {
        if (value) {
            hardcopy_condition[key] = value;
        }
    });

    if (!query_condition && hardcopy_condition.length == 0) {
        response.send_error(res, "No search parameters");
    }
    else {
        select_hardcopy_query(query_condition.book, query_condition.author, query_condition.category, hardcopy_condition, res);
    }
}

function update_hardcopy_query(parameters) {
    var values = {
        state: parameters['hardcopy_state']
    };

    if (parameters['location_id']) {
        values['location_id'] = parameters['location_id'];
    }

    return values;
}

function select_hardcopy_available(res, parameters, callback) {
    var where_condition =
    {
        book_id: parameters['book_id'],
        state: 'Available'
    };

    if (parameters['location_id']) {
        where_condition['location_id'] = parameters['location_id'];
    }

    Hardcopy.findAll({
        where: where_condition,
        include: [
            {
                model: Book,
                attributes: ['rental_days_limit']
            }
        ]
    })
        .then(function (hardcopies) {
            callback(hardcopies);
        })
        .catch(function () {
            response.send_error(res, "Query failed");
            callback(null);
        });
}

function exist_hardcopy(res, parameters, callback) {
    Hardcopy.findAndCountAll({
        where: {
            book_id: parameters['book_id']
        }
    })
        .then(function (result) {
            if (result.count == 0) {
                response.send_error(res, "No hardcopies matched for this book");
                callback(false);
            }
            else {
                callback(true);
            }
        })
        .catch(function () {
            response.send_error(res, "Query failed");
            callback(false);
        });
}

function select_hardcopy_query(book_condition, author_condition, category_condition, hardcopy_condition, res) {
    Hardcopy.findAll({
        where: hardcopy_condition,
        attributes: ['id', 'state', 'added_date'],
        include: [
            {
                model: Location
            },
            {
                model: Account,
                attributes: ['id', 'email']

            },
            {
                model: Book,
                attributes: ['id', 'title'],
                where: book_condition,
                include: [
                    {
                        model: Author,
                        attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.literal("DISTINCT `Book.Authors`.`name`")), 'name']],
                        where: author_condition
                    },
                    {
                        model: Category,
                        attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.literal("DISTINCT `Book.Categories`.`name`")), 'name']],
                        where: category_condition,
                        required: false
                    }]
            }
        ],
        group: ['Hardcopy.id']
    })
        .then(function (hardcopy) {
            response.send_success(res, hardcopy, response.query_action.SELECT);
        })
        .catch(function () {
            response.send_error(res, "Query failed");
        });
}

// When someone adds a book, if there is a waiting list for this book we assign the new hardcopy
function update_reservation_added_hardcopy (res, book_id, hardcopy_id, location_id) {
    var parameters = {
        reservation_hardcopy_id: hardcopy_id,
        book_id: book_id,
        location_id: location_id,
        hardcopy_state: "Reserved",
        queue_order: 0
    };
    reservations.count_user_waiting(res, parameters, function (count_result) {

        //A user waited for this book, we assigned the new hardcopy to his reservation
        if (count_result > 0) {

            //Mail book available
            response.mail_book_available(parameters['book_id']);

            return sequelize.transaction(function (t) {
                parameters['queue_order'] = 1;
                return reservations.update_zero_first_element(parameters, t).then(function () {
                    return reservations.update_reservation(parameters, t).then(function () {
                        return Hardcopy.update(update_hardcopy_query(parameters),
                            {
                                where: {id: parameters['reservation_hardcopy_id']},
                                transaction: t
                            });
                    });
                });
            })
                .then(function () {
                    response.send_success(res, null, response.query_action.TRANSACTION);
                })
                .catch(function () {
                    response.send_error(res, "Reservation update after add an hardcopy failed");
                });
        }
        else {
            response.send_success(res, null, response.query_action.TRANSACTION);
        }
    });
}

exports.get_specific_hardcopy = get_specific_hardcopy;
exports.create = create;
exports.update = update;
exports.delete_hardcopy = delete_hardcopy;
exports.get_account_hardcopies = get_account_hardcopies;
exports.get_hardcopies_available = get_hardcopies_available;
exports.search = search;
exports.update_hardcopy_query = update_hardcopy_query;
exports.select_hardcopy_available = select_hardcopy_available;
exports.exist_hardcopy = exist_hardcopy;

