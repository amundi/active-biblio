var nodemailer = require("nodemailer");
var models = require('./database/models');
var config = require('./config');

var HTTP_UNAUTHORIZED = 401;
var HTTP_SERV_GENERIC_ERROR = 500;
var HTTP_OK = 200;
var HTTP_CREATED = 201;

var query_action = {
    SELECT: 0,
    INSERT: 1,
    UPDATE: 2,
    DELETE: 3,
    TRANSACTION: 4
};

var mail_object = {
    RETURN_BOOK: 0,
    BOOK_AVAILABLE: 1
};

var smtpTransport = nodemailer.createTransport("SMTP",
    {
        service: "Gmail",
        auth:
        {
            user: config.mailing.user,
            pass: config.mailing.password
        }
    });

function send_success(res, result, action) {
    switch (action) {
        case query_action.SELECT:
            response_select(res, result);
            break;
		case query_action.INSERT:
            response_insert(res, result);
            break;
        case query_action.UPDATE:
            response_update(res, result);
            break;
		case query_action.DELETE:
            response_delete(res, result);
            break;
		case query_action.TRANSACTION:
            response_transaction(res);
            break;
        default:
            send_error(res, "Invalid action");
    }
}

function send_error(res, text) {
    write_response_header(res, HTTP_SERV_GENERIC_ERROR);
    res.end(JSON.stringify({
        code: HTTP_SERV_GENERIC_ERROR,
        error: text
    }));
}

function response_select(res, result) {
    write_response_header(res, HTTP_OK);
    res.end(JSON.stringify(result));
}

function response_insert(res, result) {
    write_response_header(res, HTTP_CREATED);
    res.end(JSON.stringify({
        code: HTTP_CREATED,
        insertId: result.id
    }));
}

function response_update(res, result) {
    if(result == 0) {
        write_response_header(res, HTTP_SERV_GENERIC_ERROR);
        res.end(JSON.stringify({
            code: HTTP_SERV_GENERIC_ERROR,
            error: "Nothing updated"
        }));
    }
    else {
        write_response_header(res, HTTP_OK);
        res.end();
    }
}

function response_delete(res, result) {
    if(result == 0) {
        write_response_header(res, HTTP_SERV_GENERIC_ERROR);
        res.end(JSON.stringify({
            code: HTTP_SERV_GENERIC_ERROR,
            error: "Nothing deleted"
        }));
    }
    else {
        write_response_header(res, HTTP_OK);
        res.end();
    }
}

function response_transaction(res) {
    write_response_header(res, HTTP_OK);
    res.end(JSON.stringify({
        code: HTTP_OK,
        error: "Transaction completed"
    }));
}

function write_response_header(res, status_code) {
    res.writeHead (
        status_code,
        {'Content-Type': 'application/json'}
    );
}

//MAILING system
var Account = models.Account;
var Book = models.Book;
var Reservation = models.Reservation;

function mail_book_available(book_id)
{
    Reservation.findAll({
        where: {
            book_id: book_id,
            queue_order: 1
        },
        include: [
            {
                model: Account
            },
            {
                model: Book,
                attributes: ['id', 'title']
            }
        ],
        group: ['Reservation.id']
    })
        .then(function (reservations) {
            var content = {
                mail: reservations[0].Account.email,
                title: reservations[0].Book.title
            };

            send_email(content, mail_object.BOOK_AVAILABLE);
        })
        .catch(function () {
            console.log("Mailing error");
        });
}

function mail_return_book(mail, title) {
    var content = {
        mail: mail,
        title: title
    };
    send_email(content, mail_object.RETURN_BOOK);
}


function send_email(content, object)
{
    var subject = "";
    var text = "";

    switch (object) {
        case mail_object.RETURN_BOOK:
            subject = "Somebody is waiting for " + content.title;
            text = "Can you please return " + content.title;
            break;
        case mail_object.BOOK_AVAILABLE:
            subject = content.title + " is available";
            text = "You can pick it up. Check the website for details." ;
            break;
        default:
            subject = "Error mailing";
            text = "There is a problem with Activebiblio mailing";
    }

    smtpTransport.sendMail(
        {
            from: "ActiveBiblio <no-reply@gmail.com>",
            to: content.mail,
            subject: subject,
            text: text
        }, function(error, response)
        {
            if(error)
                console.log(error);
            else
                console.log("Message sent to " + content.mail + " : " + response.message);
        });
}



exports.HTTP_UNAUTHORIZED = HTTP_UNAUTHORIZED;
exports.HTTP_SERV_GENERIC_ERROR = HTTP_SERV_GENERIC_ERROR;
exports.HTTP_OK = HTTP_OK;
exports.HTTP_CREATED = HTTP_CREATED;
exports.query_action = query_action;

exports.send_success = send_success;
exports.send_error = send_error;
exports.write_response_header = write_response_header;
exports.mail_book_available = mail_book_available;
exports.mail_return_book = mail_return_book;
exports.send_email = send_email;
