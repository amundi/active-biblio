var response = require('../response');
var util = require('../util');
var models = require('../database/models');

var Account = models.Account;

function get_accounts(res) {
    Account.findAll({})
        .then(function (accounts) {
            response.send_success(res, accounts, response.query_action.SELECT);
        })
        .catch(function () {
            response.send_error(res, "Query failed");
        });
}

// We can't lock/unlock an admin account
function lock_account(req, res) {
    var value = {
        account_id: req.params.id
    };

    if (util.check_nan_parameters(res, value)) {
        Account.update({
            state: "Locked"
        }, {
            where: {
                id: value['account_id'],
                type: {
                    $ne: "Admin"
                }
            }
        })
            .then(function (update_result) {
                response.send_success(res, update_result, response.query_action.UPDATE);
            })
            .catch(function () {
                response.send_error(res, "Couldn't lock this account");
            });
    }
}
function unlock_account(req, res) {
    var value = {
        account_id: req.params.id
    };

    if (util.check_nan_parameters(res, value)) {
        Account.update({
            state: "Available"
        }, {
            where: {
                id: value['account_id'],
                type: {
                    $ne: "Admin"
                }
            }
        })
            .then(function (update_result) {
                response.send_success(res, update_result, response.query_action.UPDATE);
            })
            .catch(function () {
                response.send_error(res, "Couldn't unlock this account");
            });
    }
}

function create_get_account(res, mail, type, callback) {
    Account.findOrCreate({where: {email: mail, type: type}})
        .spread(function (account) {
            callback(account);
        })
        .catch(function () {
            response.send_error(res, "Couldn't create/get this account");
            callback(null);
        });
}

function update_account_connected(res, account, callback) {
    Account.update({
        last_login_date: new Date()
    }, {
        where: {
            id: account.id
        }
    })
        .then(function () {
            callback(true);
        })
        .catch(function () {
            response.send_error(res, "Query failed");
            callback(false);
        });
};


exports.get_accounts = get_accounts;
exports.lock_account = lock_account;
exports.unlock_account = unlock_account;
exports.create_get_account = create_get_account;
exports.update_account_connected = update_account_connected;