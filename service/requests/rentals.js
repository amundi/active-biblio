var database = require('../database/connection');
var response = require('../response');
var util = require('../util');
var hardcopies = require('./hardcopies');
var reservations = require('./reservations');
var models = require('../database/models');
var config = require('../config');

var sequelize = database.sequelize;
var Rental = models.Rental;
var Book = models.Book;
var Author = models.Author;
var Hardcopy = models.Hardcopy;
var Reservation = models.Reservation;
var Account = models.Account;

function get_account_rentals(req, res) {
    var value = {
        account_id: req.account_logged.id
    };

    if (util.check_nan_parameters(res, value)) {
        Rental.findAll({
            where: {
                account_id: value['account_id'],
                return_date: {
                    $or: {
                        $gt: new Date(),
                        $eq: null
                    }
                }
            },
            attributes: ['id', 'rental_date', 'return_date'],
            include: [
                {
                    model: Book,
                    attributes: ['id', 'title'],
                    include: [{
                        model: Author,
                        attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.literal("DISTINCT `Book.Authors`.`name`")), 'name']]
                    }]
                }
            ],
            group: ['Rental.id']
        })
            .then(function (reservations) {
                response.send_success(res, reservations, response.query_action.SELECT);
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

function get_account_history_rentals(req, res) {
    var value = {
        account_id: req.account_logged.id
    };

    if (util.check_nan_parameters(res, value)) {
        Rental.findAll({
            where: {
                account_id: value['account_id'],
                return_date: {
                    $lt: new Date()
                }
            },
            attributes: ['id', 'rental_date', 'return_date'],
            include: [
                {
                    model: Book,
                    attributes: ['id', 'title'],
                    include: [{
                        model: Author,
                        attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.literal("DISTINCT `Book.Authors`.`name`")), 'name']]
                    }]
                }
            ],
            group: ['Rental.id']
        })
            .then(function (reservations) {
                response.send_success(res, reservations, response.query_action.SELECT);
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

// To rent a book :
// - Fail: user has already rented this book
// - Success: one hardcopy in this location is available
// - Success: one hardcopy is reserved by this user
// - Fail: All hardcopies are reserved
// If the user can rent the book, we insert it in rental table, update hardcopy state
// and delete reservation(if there is one)
function rent(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        location_id: req.body.location_id
    };

    if (util.check_nan_parameters(res, parameters)) {
        user_rental(res, parameters, function(rent_result) {
            if(!rent_result) {
                hardcopies.select_hardcopy_available(res, parameters, function (select_result) {
                    if (select_result) {
                        var data_select = select_result;

                        //Hardcopy booked by this user ?
                        parameters['reservation_hardcopy_location_id'] = parameters['location_id'];
                        reservations.user_hardcopy_reserved(res, parameters, function (hardcopy_reserved) {
                            if (hardcopy_reserved) {
                                var data_reserve = hardcopy_reserved;

                                if (data_select.length == 0 && data_reserve == 0) {
                                    response.send_error(res, "All hardcopies are unavailable");
                                }
                                //Hardcopy booked by the user or hardcopy available
                                else {
                                    data_reserve.length == 0
                                        ? parameters ['hardcopy_id'] = data_select[0].id
                                        : (
                                        parameters ['reservation_id'] = data_reserve[0].id,
                                            parameters ['hardcopy_id'] = data_reserve[0].reservation_hardcopy_id
                                    );

                                    parameters['hardcopy_state'] = "Rent";

                                    var return_date;
                                    if(config.rental_days_limit) {
                                        return_date = new Date();
                                        data_reserve.length == 0
                                            ? return_date.setDate(return_date.getDate() + data_select[0].Book.rental_days_limit)
                                            : return_date.setDate(return_date.getDate() + data_reserve[0].Book.rental_days_limit);
                                    }
                                    else {
                                        return_date = null;
                                    }

                                    return sequelize.transaction(function (t) {
                                        return Rental.create({
                                                account_id: parameters['account_id'],
                                                hardcopy_id: parameters['hardcopy_id'],
                                                book_id: parameters['book_id'],
                                                return_date: return_date
                                            },
                                            {transaction: t}).then(function (result) {
                                                if (result == 0) {
                                                    response.send_error(res, "Couldn't rent this book");
                                                }
                                                else {
                                                    return Hardcopy.update(hardcopies.update_hardcopy_query(parameters),
                                                        {where: {id: parameters['hardcopy_id']}, transaction: t})
                                                        .then(function () {
                                                            Reservation.destroy({
                                                                where: {id: parameters['reservation_id']},
                                                                transaction: t
                                                            });
                                                        });
                                                }
                                            });

                                    })
                                        .then(function () {
                                            response.send_success(res, null, response.query_action.TRANSACTION);
                                        })
                                        .catch(function () {
                                            response.send_error(res, "Couldn't rent this book");
                                        });
                                }
                            }
                        });
                    }
                });
            }
        });
    }

}

// To return a book :
// - we check if the user rented this book
// - is there someone wait for this book ?
//      - YES : assign hardcopy to the first in waiting list and mail him
//      - NO : update hardcopy to available
function rental_return(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id,
        location_id: req.body.location_id
    };

    if (util.check_nan_parameters(res, parameters)) {
        user_hardcopy_rented(res, parameters, function (hardcopy_rented) {
            if (hardcopy_rented) {
                parameters['reservation_hardcopy_id'] = hardcopy_rented[0].hardcopy_id;
                parameters['queue_order'] = 0;

                reservations.count_user_waiting(res, parameters, function (count_result) {
                    return sequelize.transaction(function (t) {
                        return Rental.update({
                            hardcopy_id: null,
                            return_date: new Date()
                        }, {
                            where: {
                                book_id: parameters['book_id'],
                                account_id: parameters['account_id'],
                                hardcopy_id: {
                                    $ne: null
                                }
                            }, transaction: t
                        }).then(function (result) {
                            if (result == 0) {
                                response.send_error(res, "Couldn't return this book");
                            }
                            else {
                                //A user waited for this book
                                if (count_result > 0) {
                                    parameters['hardcopy_state'] = "Reserved";
                                    parameters['queue_order'] = 1;

                                    //Mail book available
                                    response.mail_book_available(parameters['book_id']);

                                    return reservations.update_zero_first_element(parameters, t).then(function () {
                                        return reservations.update_reservation(parameters, t).then(function () {
                                                return Hardcopy.update(hardcopies.update_hardcopy_query(parameters),
                                                    {
                                                        where: {id: parameters['reservation_hardcopy_id']},
                                                        transaction: t
                                                    });
                                            });
                                    });
                                }
                                parameters['hardcopy_state'] = "Available";
                                return Hardcopy.update(hardcopies.update_hardcopy_query(parameters),
                                    {where: {id: parameters['reservation_hardcopy_id']}, transaction: t});
                            }
                        });

                    })
                        .then(function () {
                            response.send_success(res, null, response.query_action.TRANSACTION);
                        })
                        .catch(function () {
                            response.send_error(res, "Couldn't return this book");
                        });
                });
            }
        });
    }

}

// Return the rental if a user rented this book (function called when he wants to return the book)
function user_hardcopy_rented(res, parameters, callback) {
    Rental.findAll({
        where: {
            book_id: parameters['book_id'],
            account_id: parameters['account_id'],
            hardcopy_id: {
                $ne: null
            }
        }
    })
        .then(function (rentals) {
            if (rentals.length == 0) {
                response.send_error(res, "No rental for this user/hardcopy");
                callback(null);
            }
            else {
                callback(rentals);
            }
        })
        .catch(function () {
            response.send_error(res, "Query failed");
            callback(null);
        });
}

// Return if the user has already rent this book
function user_rental(res, parameters, callback) {
    Rental.findAndCountAll({
        where: {
            book_id: parameters['book_id'],
            account_id: parameters['account_id'],
            hardcopy_id: {
                $ne: null
            }
        }
    })
        .then(function (result) {
            if (result.count != 0) {
                response.send_error(res, "You have already rent this book");
                callback(true);
            }
            else {
                callback(false);
            }
        })
        .catch(function () {
            response.send_error(res, "Query failed");
            callback(true);
        });
}

// Return the oldest actual rental for a book
function get_oldest_rental(parameters, transaction) {
    return Rental.findAll({
        where: {
            book_id: parameters['book_id'],
            return_date: {
                $eq: null
            }
        },
        include: [
            {
                model: Book,
                attributes: ['id', 'title']
            },
            {
                model: Account
            }
        ],
        order: ['Rental.id'], transaction: transaction
    });
}

exports.get_account_rentals = get_account_rentals;
exports.get_account_history_rentals = get_account_history_rentals;
exports.rent = rent;
exports.rental_return = rental_return;
exports.user_rental = user_rental;
exports.get_oldest_rental = get_oldest_rental;