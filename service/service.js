var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var requests_accounts = require('./requests/accounts');
var requests_books = require('./requests/books');
var requests_hardcopies = require('./requests/hardcopies');
var requests_borrows = require('./requests/borrows');
var requests_reservations = require('./requests/reservations');
var requests_comments = require('./requests/comments');
var requests_favorite = require('./requests/favorite');
var requests_like = require('./requests/like');
var requests_rate = require('./requests/rate');
var requests_locations = require('./requests/locations');
var authentication = require('./requests/authentication');
var response = require('./response');
var config = require('./config');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({origin: config.access_control}));

// Server is waiting for requests
// 3 types :
// - No need to be authenticated: search/get book
// - User authentication: reservation/borrow and account management
// - Admin authentication: book/hardcopies management

app.post('/login', function (req, res) {
    authentication.login(req, res);
});

app.get('/books/:id', function (req, res) {
    requests_books.get_specific_book(req, res);
});

app.get('/books', function (req, res) {
    requests_books.search(req, res);
});

app.post('/books', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_books.create(req, res);
    }
});

app.put('/books/:id', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_books.update(req, res);
    }
});

app.post('/books/:id/addAuthor', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_books.addAuthor(req, res);
    }
});

app.delete('/books/:id/deleteAuthor/:author_name', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_books.deleteAuthor(req, res);
    }
});

app.post('/books/:id/addCategory', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_books.addCategory(req, res);
    }
});

app.delete('/books/:id/deleteCategory/:category_name', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_books.deleteCategory(req, res);
    }
});

app.get('/books/:id/hardcopiesAvailable', function (req, res) {
    requests_hardcopies.get_hardcopies_available(req, res);
});

app.get('/hardcopies', function (req, res) {
    requests_hardcopies.search(req, res);
});
app.get('/hardcopies/:id', function (req, res) {
    requests_hardcopies.get_specific_hardcopy(req, res);
});

app.post('/hardcopies', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_hardcopies.create(req, res);
    }
});

app.put('/hardcopies/:id', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_hardcopies.update(req, res);
    }
});

app.delete('/hardcopies/:id', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_hardcopies.delete_hardcopy(req, res);
    }
});

app.get('/books/:id/comments', function (req, res) {
    requests_comments.get_book_comments(req, res);
});

app.post('/books/:id/comments', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_comments.create(req, res);
    }
});

app.delete('/books/:id/comments/:comment_id', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_comments.delete_comment(req, res);
    }
});

app.post('/books/:id/favorite', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_favorite.create(req, res);
    }
});

app.delete('/books/:id/favorite', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_favorite.delete_favorite(req, res);
    }
});

app.get('/books/:id/favorite', function (req, res) {
    if (authentication.get_account_token(req)) {
        requests_favorite.get_account_favorite_book(req, res);
    }
    else {
        response.send_success(res, {}, response.query_action.SELECT)
    }
});

app.post('/books/:id/like', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_like.create(req, res);
    }
});

app.delete('/books/:id/like', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_like.delete_like(req, res);
    }
});

app.get('/books/:id/like', function (req, res) {
    if (authentication.get_account_token(req)) {
        requests_like.get_account_like(req, res);
    }
    else {
        response.send_success(res, {}, response.query_action.SELECT)
    }
});

app.put('/books/:id/rate', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_rate.put(req, res);
    }
});

app.get('/books/:id/rate', function (req, res) {
    if (authentication.get_account_token(req)) {
        requests_rate.get_account_rate(req, res);
    }
    else {
        response.send_success(res, {}, response.query_action.SELECT)
    }
});

app.get('/admin/accounts', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_accounts.get_accounts(res);
    }
});

app.put('/admin/accounts/:id/lock', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_accounts.lock_account(req, res);
    }
});

app.put('/admin/accounts/:id/unlock', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_accounts.unlock_account(req, res);
    }
});

app.put('/admin/accounts/:id/upgrade', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_accounts.upgrade(req, res);
    }
});

app.get('/users/borrows', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_borrows.get_account_borrows(req, res);
    }
});

app.get('/users/history/borrows', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_borrows.get_account_history_borrows(req, res);
    }
});

app.get('/users/hardcopies', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_hardcopies.get_account_hardcopies(req, res);
    }
});

app.get('/users/reservations', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_reservations.get_account_reservations(req, res);
    }
});

app.get('/users/favorites', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_favorite.get_account_favorites(req, res);
    }
});

app.post('/books/:id/reservations', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_reservations.reserve(req, res);
    }
});

app.delete('/books/:id/reservations', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_reservations.cancel(req, res);
    }
});

app.post('/books/:id/borrows', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_borrows.rent(req, res);
    }
});

app.put('/books/:id/borrows/', function (req, res) {
    if (authentication.is_authenticated(req, res)) {
        requests_borrows.borrow_return(req, res);
    }
});

app.get('/locations', function (req, res) {
    requests_locations.get_locations(res);
});

app.post('/location', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_locations.create(req, res);
    }
});

app.delete('/location/:id', function (req, res) {
    if (authentication.is_admin(req, res)) {
        requests_locations.delete_location(req, res);
    }
});

app.listen(8090);
console.log("Server's listenning");

exports.app = app;