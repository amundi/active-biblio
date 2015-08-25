var database = require('../database/connection');
var response = require('../response');
var util = require('../util');
var hardcopies = require('./hardcopies');
var rentals = require('./rentals');
var _ = require('underscore');
var models = require('../database/models');
var config = require('../config');

var sequelize = database.sequelize;
var Reservation = models.Reservation;
var Book = models.Book;
var Author = models.Author;
var Location = models.Location;
var Hardcopy = models.Hardcopy;
var Rental = models.Rental;

var date_return = new Date();
date_return.setDate(date_return.getDate() + config.delay_to_return_book);

var date_deadline = new Date();
date_deadline.setDate(date_deadline.getDate() + config.delay_to_pick_book_reserved);

function get_account_reservations(req, res) {
    var value = {
        account_id: req.account_logged.id
    };

    if (util.check_nan_parameters(res, value)) {
        Reservation.findAll({
            where: value,
            attributes: ['id', 'queue_order', 'reservation_deadline'],
            include: [
                {
                    model: Book,
                    attributes: ['id', 'title'],
                    include: [{
                        model: Author,
                        attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.literal("DISTINCT `Book.Authors`.`name`")), 'name']]
                    }]
                },
                {
                    model: Location
                }
            ],
            group: ['Reservation.id']
        })
            .then(function (reservations) {
                response.send_success(res, reservations, response.query_action.SELECT);
            })
            .catch(function (error) {
                console.log(error);
                response.send_error(res, "Query failed");
            });
    }
}

// To reserve a book :
// - Fail: user has already reserved this book
// - Fail: no hardcopies for this book
// - Hardcopy available: insert into reservation table with queue order 0 and the user can
// pick it up
// - All hardcopies reserved: Insert into reservation table and put it at the end or the queue
function reserve(req, res) {
    var parameters = {
        account_id: req.account_logged.id,
        book_id: req.params.id
    };

    if (util.check_nan_parameters(res, parameters)) {
        hardcopies.exist_hardcopy(res, parameters, function (result_exists) {
            if (result_exists) {
                user_reservation(res, parameters, function (reservation_exists) {
                    if (!reservation_exists) {
                        rentals.user_rental(res, parameters, function(rent_result) {
                            if(!rent_result) {
                                count_reservation(res, parameters, function (count_result) {
                                    if (count_result != 'error') {
                                        parameters['queue_order'] = count_result + 1;

                                        hardcopies.select_hardcopy_available(res, parameters, function (select_result) {
                                            if (select_result) {
                                                var row = select_result;

                                                return sequelize.transaction(function (t) {
                                                    if (row.length == 0) {

                                                        return Reservation.create(insert_reservation_query(parameters),
                                                            {transaction: t}).then(function () {

                                                                // Mailing user + update return date to return the book
                                                                // if it's unlimited and someone reserves this book
                                                                if (!config.rental_days_limit) {
                                                                    return rentals.get_oldest_rental(parameters, t).then(function (rentals) {
                                                                        if (rentals.length != 0) {
                                                                            response.mail_return_book(rentals[0].Account.email, rentals[0].Book.title);

                                                                            return Rental.update({
                                                                                return_date: date_return
                                                                            }, {
                                                                                where: {
                                                                                    book_id: parameters['book_id'],
                                                                                    account_id: rentals[0].Account.id,
                                                                                    hardcopy_id: {
                                                                                        $ne: null
                                                                                    }
                                                                                }, transaction: t
                                                                            });
                                                                        }
                                                                    });

                                                                }
                                                            });
                                                    }
                                                    else {
                                                        parameters['queue_order'] = 0;
                                                        parameters['reservation_hardcopy_id'] = row[0].id;
                                                        parameters['reservation_hardcopy_location_id'] = row[0].location_id;
                                                        parameters['reservation_deadline'] = date_deadline;

                                                        return Reservation.create(insert_reservation_query(parameters),
                                                            {transaction: t}).then(function () {
                                                                parameters['hardcopy_state'] = "Reserved";
                                                                return Hardcopy.update(hardcopies.update_hardcopy_query(parameters),
                                                                    {
                                                                        where: {id: parameters['reservation_hardcopy_id']},
                                                                        transaction: t
                                                                    });
                                                            });
                                                    }
                                                })
                                                    .then(function () {
                                                        response.send_success(res, null, response.query_action.TRANSACTION);
                                                    })
                                                    .catch(function (error) {
                                                        console.log(error);
                                                        response.send_error(res, "Couldn't reserve this book");
                                                    });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

// Cancel a book means delete to the reservation table and update all others which waited for
// this book
function cancel(req, res) {
    var parameters = {
        book_id: req.params.id,
        account_id: req.account_logged.id
    };

    if (util.check_nan_parameters(res, parameters)) {
        select_reservation(res, parameters, function (select_result) {
            if (select_result) {
                var row = select_result;

                parameters['queue_order'] = row[0].queue_order;
                parameters['book_id'] = row[0].book_id;
                parameters['location_id'] = row[0].reservation_hardcopy_location_id;
                parameters['reservation_hardcopy_id'] = row[0].reservation_hardcopy_id;

                count_user_waiting(res, parameters, function (count_result) {
                    if (count_result != 'error') {
                        return sequelize.transaction(function (t) {
                            return delete_reservation(parameters, t)
                                .then(function (result) {
                                    if (result == 0) {
                                        response.send_error(res, "Couldn't cancel this reservation");
                                    }
                                    else {
                                        if (count_result > 0) {
                                            if (parameters['queue_order'] == 0) {
                                                //Mail book available
                                                response.mail_book_available(parameters['book_id']);

                                                return update_zero_first_element(parameters, t).then(function () {
                                                    return update_reservation(parameters, t);
                                                });
                                            }
                                            else {
                                                return update_reservation(parameters, t);
                                            }
                                        }
                                        else if (parameters['queue_order'] == 0) {
                                            parameters['hardcopy_state'] = "Available";
                                            return Hardcopy.update(hardcopies.update_hardcopy_query(parameters),
                                                {where: {id: parameters['reservation_hardcopy_id']}, transaction: t});
                                        }
                                    }
                                })
                        })
                            .then(function () {
                                response.send_success(res, null, response.query_action.TRANSACTION);
                            })
                            .catch(function () {
                                response.send_error(res, "Couldn't delete this reservation");
                            });
                    }
                });
            }
        });
    }
}

function delete_reservation(parameters, transaction) {
    return Reservation.destroy({
        where: {
            book_id: parameters['book_id'],
            account_id: parameters['account_id']
        }, transaction: transaction
    });
}

// Update reservation when the user can pick the book
function update_zero_first_element(parameters, transaction) {
    return Reservation.update({
        reservation_deadline: date_deadline,
        queue_order: 0,
        reservation_hardcopy_id: parameters['reservation_hardcopy_id'],
        reservation_hardcopy_location_id: parameters['location_id']
    }, {
        where: {
            book_id: parameters['book_id'],
            queue_order: 1
        }, transaction: transaction
    });
}

function update_reservation(parameters, transaction) {
    return Reservation.update({
        queue_order: sequelize.literal('queue_order - 1')
    }, {
        where: {
            book_id: parameters['book_id'],
            queue_order: {
                $gt: parameters['queue_order'],
                $gt: 1
            }
        }, transaction: transaction
    });
}

function count_reservation(res, parameters, callback) {
    Reservation.findAndCountAll({
        where: {
            book_id: parameters['book_id'],
            queue_order: {
                $gt: 0
            }
        }
    })
        .then(function (result) {
            callback(result.count)
        })
        .catch(function () {
            response.send_error(res, "Query failed");
            callback('error');
        });
}

// Check if the user has already reserved this book
function user_reservation(res, parameters, callback) {
    Reservation.findAndCountAll({
        where: {
            book_id: parameters['book_id'],
            account_id: parameters['account_id']
        }
    })
        .then(function (result) {
            if (result.count != 0) {
                response.send_error(res, "You have already reserved this book");
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

function insert_reservation_query(parameters) {
    var values = {};

    _.each(parameters, function (value, key) {
        values[key] = value;
    });

    return values;
}

function select_reservation(res, parameters, callback) {
    Reservation.findAll({
        where: {
            book_id: parameters['book_id'],
            account_id: parameters['account_id']
        }
    })
        .then(function (result) {
            if (result.length != 0) {
                callback(result);
            }
            else {
                callback(null);
                response.send_error(res, "This reservation doesn't exist");
            }
        })
        .catch(function () {
            response.send_error(res, "Query failed");
            callback(null);
        });
}

function user_hardcopy_reserved(res, parameters, callback) {
    Reservation.findAll({
        where: {
            account_id: parameters['account_id'],
            book_id: parameters['book_id'],
            queue_order: 0,
            reservation_hardcopy_location_id: parameters['reservation_hardcopy_location_id']
        },
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

function count_user_waiting(res, parameters, callback) {
    Reservation.findAndCountAll({
        where: {
            book_id: parameters['book_id'],
            queue_order: {
                $gt: parameters['queue_order']
            }
        }
    })
        .then(function (result) {
            callback(result.count)
        })
        .catch(function () {
            response.send_error(res, "Query failed");
            callback('error');
        });
}

exports.get_account_reservations = get_account_reservations;
exports.reserve = reserve;
exports.cancel = cancel;
exports.delete_reservation = delete_reservation;
exports.update_zero_first_element = update_zero_first_element;
exports.update_reservation = update_reservation;
exports.user_hardcopy_reserved = user_hardcopy_reserved;
exports.count_user_waiting = count_user_waiting;