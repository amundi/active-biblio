var fs = require('fs');
var readline = require('readline');
var soap = require('soap');
var jwt = require('jsonwebtoken');
var config = require('../config');
var response = require('../response');
var accounts = require('./accounts');

var apiKey = 'ActiveBiblio';

function login(req, res) {
    var mail = req.body.mail;
    var password = req.body.password;
    auth(mail, password, function (logged_mail) {
        if (logged_mail) {
            check_admin_file(mail, function (type) {
                accounts.create_get_account(res, logged_mail, type, function (account) {
                    if (account && account.state == 'Available') {
                        accounts.update_account_connected(res, account, function (result) {
                            if(result) {
                                create_token(res, account);
                            }
                        });
                    }
                    else {
                        response.send_error(res, "Couldn't connect to this account: account locked");
                    }
                });
            });
        }
        else {
            response.send_error(res, "Invalid username/password");
        }
    });
}

function auth(mail, password, callback) {
    switch (config.auth.method) {
        case 'webservice':
            webservice_login(mail, password, config.auth.params.wsdl_file, function (result) {
                callback(result);
            });
            break;
        case 'file':
            plaintext_login(mail, password, function (result) {
                callback(result);
            });
            break;
        default:
            callback(false);
    }
}

function webservice_login(mail, password, url, callback) {
    soap.createClient(url, function (err, client) {
        client.auth.authPort.auth({
                client: config.auth.params.extra_args[0],
                type: config.auth.params.extra_args[1],
                debug: config.auth.params.extra_args[2],
                token: config.auth.params.extra_args[3],
                language: config.auth.params.extra_args[4],
                login: mail,
                password: password
            },
            function (err, result) {
                if(err) {
                    callback(null);
                }
                else {
                    result.return.$value ? callback(result.persondata.mail.$value) : callback(null);
                }
            });
    });
}

function plaintext_login(mail, password, callback) {
    var logged = null;

    var rd = readline.createInterface({
        input: fs.createReadStream(config.auth.params.file),
        output: process.stdout,
        terminal: false
    });

    rd.on('line', function (line) {
        var entry = line.split(':');
        if (entry[0] == mail && entry[1] == password) {
            logged = mail;
        }
    })
        .on('close', function () {
            callback(logged);
        });
}

// Determine if a user (when he connects) is admin or not
function check_admin_file(mail, callback) {
    var type = "User";

    var rd = readline.createInterface({
        input: fs.createReadStream(config.admin_file),
        output: process.stdout,
        terminal: false
    });

    rd.on('line', function (line) {
        var entry = line.split(':');
        if (entry[0] == mail) {
            type = "Admin";
        }
    })
        .on('close', function () {
            callback(type);
        });
}

// Create a token for authenticated rest calls
function create_token(res, account) {
    var token = jwt.sign(account, apiKey, {});

    response.write_response_header(res, response.HTTP_OK);

    res.end(JSON.stringify({
        success: true,
        message: "You are connected",
        token: token,
        type_account: account.type
    }));
}

function is_authenticated(req, res) {
    var token = req.headers.authorization;
    if(token) {
        try {
            req.account_logged = jwt.verify(token, apiKey);
            return true;
        } catch(err) {
            connection_failed(res);
            return false;
        }
    }
    else {
        connection_failed(res);
        return false;
    }
}

function is_admin(req, res) {
    if(is_authenticated(req, res)) {
        if(req.account_logged.type == 'Admin') {
            return true;
        }
        else {
            response.send_error(res, "Only admin can use this feature");
            return false;
        }
    }
    else {
        return false;
    }
}

// Return the token if someone is connected
function get_account_token(req) {
    var token = req.headers.authorization;
    if(token) {
        try {
            req.account_logged = jwt.verify(token, apiKey);
            return true;
        } catch(err) {
            return false;
        }
    }
    else {
        return false;
    }
}

// Return connection error message
function connection_failed(res) {
    response.write_response_header(res, response.HTTP_UNAUTHORIZED);
    res.end(JSON.stringify({
        code: response.HTTP_UNAUTHORIZED,
        error: "You are not connected. Please log in"
    }));
}

exports.login = login;
exports.is_authenticated = is_authenticated;
exports.is_admin = is_admin;
exports.get_account_token = get_account_token;

