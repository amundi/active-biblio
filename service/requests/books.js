var database = require('../database/connection');
var response = require('../response');
var util = require('../util');
var _ = require('underscore');
var models = require('../database/models');
var config = require('../config');

var sequelize = database.sequelize;
var Book = models.Book;
var Author = models.Author;
var Category = models.Category;
var Rate = models.Rate;
var Vote = models.Vote;

var VOTETYPE_LIKE = 1;

// Request to select book with a specific id
function get_specific_book(req, res) {
    var value = {
        id: req.params.id
    };

    if (util.check_nan_parameters(res, value)) {
        select_book_query(value, null, null, res);
    }
}

// Update book:
// - update book
// - delete and add authors
// - delete and add categories
function update(req, res) {
    var numeric_parameters = {
        book_id: req.params.id,
        isbn10: req.body.isbn10,
        isbn13: req.body.isbn13,
        published_date: req.body.published_date,
        pages: req.body.pages,
        borrow_days_limit: req.body.borrow_days_limit
    };

    var textual_parameters = {
        title: req.body.title,
        language: req.body.language,
        publisher: req.body.publisher,
        description: req.body.description,
        photo: req.body.photo
    };

    var parameters = {};

    _.each(numeric_parameters, function (value, key) {
        if (value) {
            parameters[key] = value;
        }
    });

    if (util.check_nan_parameters(res, parameters)) {
        _.each(textual_parameters, function (value, key) {
            if (value) {
                parameters[key] = value;
            }
        });

        var authors = req.body.author ? _.flatten(new Array(req.body.author)) : undefined;
        var categories = req.body.category ? _.flatten(new Array(req.body.category)) : undefined;

        if (authors && authors.length != 0) {
            return sequelize.transaction(function (t) {
                return Book.update(parameters, {
                    where: {
                        id: req.params.id
                    }, transaction: t
                }).then(function () {
                    return Author.destroy({
                        where: {
                            book_id: req.params.id
                        }, transaction: t
                    }).then(function () {
                        return Author.bulkCreate(
                            insert_author_query(req.params.id, authors),
                            {transaction: t}).then(function () {
                                return Category.destroy({
                                    where: {
                                        book_id: req.params.id
                                    }, transaction: t
                                }).then(function () {
                                    if (categories && categories.length != 0) {
                                        return Category.bulkCreate(
                                            insert_category_query(req.params.id, categories),
                                            {transaction: t});
                                    }
                                });
                            });
                    });
                });

            })
                .then(function () {
                    response.send_success(res, null, response.query_action.TRANSACTION);
                })
                .catch(function () {
                    response.send_error(res, "Couldn't update this book");
                });
        }
        else {
            response.send_error(res, "Author not specified");
        }
    }
}

// 2 search :
// - one string: Search in book detail (title, language, publisher, description, isbn10 and isbn13)
// - advanced: Search by user parameters
// We create the query and call select query
function search(req, res) {
    var book_condition;
    var author_condition;
    var category_condition;
    var query_condition;

    //Search all
    if (req.query.query) {
        var query = req.query.query;
        author_condition = null;
        category_condition = null;

        if (isNaN(query)) {
            query = query.toLowerCase();
            book_condition = {
                $or: [
                    {
                        title: {
                            $like: '%' + query + '%'
                        }
                    },
                    {
                        language: {
                            $like: '%' + query + '%'
                        }
                    },
                    {
                        publisher: {
                            $like: '%' + query + '%'
                        }
                    },
                    {
                        description: {
                            $like: '%' + query + '%'
                        }
                    }
                ]
            };
        }
        else {
            book_condition = {
                $or: [
                    {isbn10: query},
                    {isbn13: query}
                ]
            };
        }

        query_condition = {
            book: book_condition,
            author: author_condition,
            category: category_condition
        };
    }
    //Search parameters
    else {
        var numeric_parameters_book = {
            isbn10: req.query.isbn10,
            isbn13: req.query.isbn13,
            published_date: req.query.published_date,
            pages: req.query.pages,
            borrow_days_limit: req.query.borrow_days_limit
        };

        var textual_parameters_book = {
            title: req.query.title,
            language: req.query.language,
            publisher: req.query.publisher,
            description: req.query.description,
            author: req.query.author ? _.flatten(new Array(req.query.author)) : undefined,
            category: req.query.category ? _.flatten(new Array(req.query.category)) : undefined
        };

        query_condition = search_query_construction(textual_parameters_book, numeric_parameters_book);
    }


    if (!query_condition) {
        response.send_error(res, "No search parameters");
    }
    else {
        select_book_query(query_condition.book, query_condition.author, query_condition.category, res);
    }
}

function create(req, res) {
    var parameters = {
        isbn10: req.body.isbn10,
        isbn13: req.body.isbn13,
        published_date: req.body.published_date,
        pages: req.body.pages,
        borrow_days_limit: config.borrow_delay,
        title: req.body.title,
        language: req.body.language
    };

    var param_optional = {
        publisher: req.body.publisher,
        description: req.body.description,
        photo: req.body.photo
    };

    var authors = req.body.author ? _.flatten(new Array(req.body.author)) : undefined;
    var categories = req.body.category ? _.flatten(new Array(req.body.category)) : undefined;

    if (util.check_undefined_parameters(res, parameters)) {
        _.each(param_optional, function (value, key) {
            value ? parameters[key] = value : value;
        });

        var numeric_param = {
            isbn10: parameters['isbn10'],
            isbn13: parameters['isbn13'],
            published_date: parameters['published_date'],
            pages: parameters['pages'],
            borrow_days_limit: parameters['borrow_days_limit']
        };

        if (parameters['isbn10'].length != 10) {
            response.send_error(res, "ISBN10 length mismatch");
        }
        else if (parameters['isbn13'].length != 13) {
            response.send_error(res, "ISBN13 length mismatch");
        }
        else if (!authors || authors.length == 0) {
            response.send_error(res, "This book doesn't have an author");
        }
        else if (util.check_nan_parameters(res, numeric_param)) {
            return sequelize.transaction(function (t) {
                return Book.create(parameters, {transaction: t}).then(function (book) {
                    return Author.bulkCreate(
                        insert_author_query(book.dataValues.id, authors),
                        {transaction: t}).then(function () {
                            if (categories && categories.length != 0) {
                                return Category.bulkCreate(
                                    insert_category_query(book.dataValues.id, categories),
                                    {transaction: t});
                            }
                        });
                });
            })
                .then(function () {
                    response.send_success(res, null, response.query_action.TRANSACTION);
                })
                .catch(function () {
                    response.send_error(res, "Couldn't add this book");
                });
        }
    }
}

function addAuthor(req, res) {
    var parameters = {
        book_id: req.params.id,
        name: req.body.author
    };

    if (util.check_undefined_parameters(res, parameters)) {
        Author.create(parameters)
            .then(function (insert_result) {
                response.send_success(res, insert_result.dataValues, response.query_action.INSERT);
            }).catch(function () {
                response.send_error(res, "Couldn't add this author");
            });
    }
}

function deleteAuthor(req, res) {
    var parameters = {
        book_id: req.params.id,
        name: req.params.author_name
    };

    if (util.check_undefined_parameters(res, parameters)) {
        Author.count({
            where: {book_id: parameters['book_id']}
        })
            .then(function (count) {
                if (count == 1) {
                    response.send_error(res, "We need an author for this book");
                }
                else {
                    Author.destroy({
                        where: parameters
                    })
                        .then(function (delete_result) {
                            response.send_success(res, delete_result, response.query_action.DELETE);
                        })
                        .catch(function () {
                            response.send_error(res, "Couldn't delete this author");
                        });
                }
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

function addCategory(req, res) {
    var parameters = {
        book_id: req.params.id,
        name: req.body.category
    };

    if (util.check_undefined_parameters(res, parameters)) {
        Category.create(parameters)
            .then(function (insert_result) {
                response.send_success(res, insert_result.dataValues, response.query_action.INSERT);
            }).catch(function () {
                response.send_error(res, "Couldn't add this category");
            });
    }
}

function deleteCategory(req, res) {
    var parameters = {
        book_id: req.params.id,
        name: req.params.category_name
    };

    if (util.check_undefined_parameters(res, parameters)) {
        Category.destroy({
            where: parameters
        })
            .then(function (delete_result) {
                response.send_success(res, delete_result, response.query_action.DELETE);
            })
            .catch(function () {
                response.send_error(res, "Couldn't delete this category");
            });
    }
}

// Query construction to select book in db
function search_query_construction(textual_parameters, numeric_parameters) {
    var book_condition = {};
    var author_condition = {};
    var category_condition = {};

    // Book parameters
    _.each(textual_parameters, function (value, key) {
        if (value && key != "author" && key != "category") {
            book_condition[key] =
            {$like: '%' + value.toLowerCase() + '%'};
        }
    });

    _.each(numeric_parameters, function (value, key) {
        if (value) {
            book_condition[key] = value;
        }
    });

    // Author parameters
    if (textual_parameters['author']) {
        author_condition['name'] = {};
        author_condition['name']['$or'] = {};
        _.each(textual_parameters['author'], function (value) {
            author_condition['name']['$or'] =
            {$like: '%' + value.toLowerCase() + '%'};
        });
    }

    // Category parameters
    if (textual_parameters['category']) {
        category_condition['name'] = {};
        category_condition['name']['$or'] = {};
        _.each(textual_parameters['category'], function (value) {
            category_condition['name']['$or'] =
            {$like: '%' + value.toLowerCase() + '%'};
        });
    }

    if(!_.isEmpty(book_condition) || !_.isEmpty(author_condition)
    || !_.isEmpty(category_condition)) {
        return callback = {
            book: book_condition,
            author: author_condition,
            category: category_condition
        };
    }
    else {
        return null;
    }

}

function insert_author_query(book_id, authors) {
    var author_values = [];

    _.each(authors, function (value) {
        author_values.push({book_id: book_id, name: value});
    });
    return author_values;
}

function insert_category_query(book_id, categories) {
    var category_values = [];

    _.each(categories, function (value) {
        category_values.push({book_id: book_id, name: value});
    });
    return category_values;
}

// Request to select book
// Returns book details, authors, categories, likes_count and average_rate
function select_book_query(book_condition, author_condition, category_condition, res) {
    Book.findAll({
        where: book_condition,
        include: [
            {
                model: Author,
                attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.literal("DISTINCT Authors.name")), 'name']],
                where: author_condition
            },
            {
                model: Category,
                attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.literal("DISTINCT Categories.name")), 'name']],
                where: category_condition,
                required: false
            },
            {
                model: Rate,
                attributes: [[sequelize.fn('AVG', sequelize.col('Rates.mark')), 'avg_rate']],
                required: false
            },
            {
                model: Vote,
                attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Votes.id'))), 'count_like']],
                where: {
                    votetype_id: VOTETYPE_LIKE
                },
                required: false
            }
        ],
        group: ['Book.id']
    })
        .then(function (book) {
            response.send_success(res, book, response.query_action.SELECT);
        })
        .catch(function () {
            response.send_error(res, "Query failed");
        });
}

exports.get_specific_book = get_specific_book;
exports.update = update;
exports.search = search;
exports.create = create;
exports.addAuthor = addAuthor;
exports.deleteAuthor = deleteAuthor;
exports.addCategory = addCategory;
exports.deleteCategory = deleteCategory;
exports.search_query_construction = search_query_construction;
exports.insert_author_query = insert_author_query;
exports.insert_category_query = insert_category_query;