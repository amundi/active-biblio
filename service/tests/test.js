var should = require("should");
var request = require("supertest");
var config = require('../config');
var service = require('../service');
var response = require('../response');


process.env.is_test = true;

config.auth = {
    method: 'file',
    params: {
        file: "./tests/test_passwords.txt"
    }
};
var url = "http://localhost:8080";
service.app.listen(8080);

// Data for tests
var minISBN10 = 1000000000;
var maxISBN10 = 9999999999;
var minISBN13 = 1000000000000;
var maxISBN13 = 9999999999999;
var users = [
    {log: {mail: "admin@admin.com", password: "admin"}, token: ""},
    {log: {mail: "user@user.com", password: "user"}, token: ""},
    {log: {mail: "user2@user2.com", password: "user2"}, token: ""},
    {log: {mail: "user3@user3.com", password: "user3"}, token: ""},
    {log: {mail: "user4@user4.com", password: "user4"}, token: ""}
];

var commentData = {comment_text: "TE ST"};
var comment_id_inserted;
var rateData = {mark: 7};
var locationData = {building: "Building", floor: 10, room: "J80"};
var location_id_inserted;

var isbn10 = (Math.floor((maxISBN10 - minISBN10) * Math.random()) + minISBN10).toString();
var isbn13 = (Math.floor((maxISBN13 - minISBN13) * Math.random()) + minISBN13).toString();
var bookData = {
    title: "title",
    isbn10: isbn10,
    isbn13: isbn13,
    author: ["aut hor0", "author1"],
    category: "category0",
    publisher: "publisher",
    published_date: 2016,
    language: "french",
    description: "description",
    pages: 20
};
var book_id_inserted;

var hardcopyData = bookData;
hardcopyData.title = "Updated";
hardcopyData.author = ["Up dated"];
hardcopyData['location_id'] = 1;
var hardcopy_id_inserted;


describe("Account", function () {
    describe("login", function () {

        it("should fail", function (done) {
            request(url)
                .post('/login')
                .send({})
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should return a token (admin)", function (done) {
            request(url)
                .post('/login')
                .send(users[0].log)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("token");
                    res.body.type_account.should.be.exactly("Admin");
                    users[0].token = res.body.token;
                    done();
                });
        });

        it("should return a token (user)", function (done) {
            request(url)
                .post('/login')
                .send(users[1].log)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("token");
                    res.body.type_account.should.be.exactly("User");
                    users[1].token = res.body.token;
                    done();
                });
        });
    });

    describe("authenticated requests", function () {

        it("should fail (not connected)", function (done) {
            request(url)
                .get('/admin/accounts')
                .expect(response.HTTP_UNAUTHORIZED)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should fail (not an admin)", function (done) {
            request(url)
                .get('/admin/accounts')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should success", function (done) {
            request(url)
                .get('/admin/accounts')
                .set('Authorization', users[0].token)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.not.be.empty;
                    done();
                });
        });
    });

    describe("lock/unlock", function () {
        it("should lock account #2", function (done) {
            request(url)
                .put('/admin/accounts/2/lock')
                .set('Authorization', users[0].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
        it("should unlock account #2", function (done) {
            request(url)
                .put('/admin/accounts/2/unlock')
                .set('Authorization', users[0].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });
});

describe("Comment", function () {
    describe("comment", function () {
        it("should success", function (done) {
            request(url)
                .post('/books/1/comments')
                .set('Authorization', users[1].token)
                .send(commentData)
                .expect(response.HTTP_CREATED)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("insertId");
                    comment_id_inserted = res.body.insertId;
                    done();
                });
        });
    });

    describe("delete comment", function () {
        it("should success", function (done) {
            request(url)
                .delete('/books/1/comments/' + comment_id_inserted)
                .set('Authorization', users[0].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });
});

describe("Favorite", function () {
    describe("favorite", function () {
        it("should success", function (done) {
            request(url)
                .post('/books/1/favorite')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_CREATED)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("insertId");
                    done();
                });
        });

        it("should fail (already in favorite list)", function (done) {
            request(url)
                .post('/books/1/favorite')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    describe("get account favorites", function () {
        it("should success (not empty)", function (done) {
            request(url)
                .get('/users/favorites')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.not.be.empty;
                    done();
                });
        });
    });

    describe("get account favorite book", function () {
        it("should success (not empty)", function (done) {
            request(url)
                .get('/books/1/favorite')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.not.be.empty;
                    done();
                });
        });
    });

    describe("delete favorite", function () {
        it("should success", function (done) {
            request(url)
                .delete('/books/1/favorite')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });
});

describe("Like", function () {
    describe("like", function () {
        it("should success", function (done) {
            request(url)
                .post('/books/1/like')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_CREATED)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("insertId");
                    done()
                });
        });

        it("should fail (already liked)", function (done) {
            request(url)
                .post('/books/1/like')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });
        });
    });

    describe("get account like book", function () {
        it("should success (not empty)", function (done) {
            request(url)
                .get('/books/1/like')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.not.be.empty;
                    done()
                });
        });
    });

    describe("cancel like", function () {
        it("should success", function (done) {
            request(url)
                .delete('/books/1/like')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });
        });
    });
});

describe("Rate", function () {
    describe("rate(create)", function () {
        it("should success", function (done) {
            request(url)
                .put('/books/1/rate')
                .set('Authorization', users[1].token)
                .send(rateData)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });
        });
    });
});

describe("Location", function () {
    describe("create a location", function () {
        it("should success", function (done) {
            request(url)
                .post('/location')
                .set('Authorization', users[0].token)
                .send(locationData)
                .expect(response.HTTP_CREATED)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("insertId");
                    location_id_inserted = res.body.insertId;
                    done()
                });
        });

        it("should fail (location already in database)", function (done) {
            request(url)
                .post('/location')
                .set('Authorization', users[0].token)
                .send(locationData)
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });
        });
    });

    describe("delete location", function () {
        it("should success", function (done) {
            request(url)
                .delete('/location/' + location_id_inserted)
                .set('Authorization', users[0].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });
        });
    });
});

describe("Book", function () {

    describe("get_specific_book", function () {
        it("should return book#1", function (done) {
            request(url)
                .get('/books/1')
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body[0].id.should.eql(1);
                    done();
                });
        });

        it("should return body empty (book_id unknown)", function (done) {
            request(url)
                .get('/books/-1')
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.be.empty;
                    done();
                });
        });
    });

    describe("create book", function () {
        it("should success", function (done) {
            request(url)
                .post('/books')
                .set('Authorization', users[0].token)
                .send(bookData)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should fail (isbn10/13 unique)", function (done) {
            request(url)
                .post('/books')
                .send(bookData)
                .set('Authorization', users[0].token)
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    describe("search", function () {
        it("should success (return book created)", function (done) {
            request(url)
                .get("/books?isbn10=" + isbn10)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.not.be.empty;
                    book_id_inserted = res.body[0].id;
                    done();
                });
        });
    });

    describe("update book #" + book_id_inserted, function () {
        it("should success (action)", function (done) {
            bookData.title = "Updated";
            bookData.author = ["Up dated"];

            request(url)
                .put('/books/' + book_id_inserted)
                .set('Authorization', users[0].token)
                .send(bookData)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should success(data updated)", function (done) {
            request(url)
                .get('/books/' + book_id_inserted)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body[0].title.should.eql("Updated");
                    res.body[0].Authors[0].name.should.eql("Up dated");
                    done();
                });
        });
    });

    describe("add author", function () {
        it("should success", function (done) {
            request(url)
                .post("/books/" + book_id_inserted + "/addAuthor")
                .send({author: "JEAN"})
                .set('Authorization', users[0].token)
                .expect(response.HTTP_CREATED)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("insertId");
                    done();
                });
        });

        it("should fail (unique (book_id/author))", function (done) {
            request(url)
                .post("/books/" + book_id_inserted + "/addAuthor")
                .send({author: "JEAN"})
                .set('Authorization', users[0].token)
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    describe("delete author", function () {
        it("should success", function (done) {
            request(url)
                .delete("/books/" + book_id_inserted + "/deleteAuthor/JEAN")
                .set('Authorization', users[0].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should fail (no match)", function (done) {
            request(url)
                .delete("/books/" + book_id_inserted + "/deleteAuthor/JEAN")
                .set('Authorization', users[0].token)
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    describe("add category", function () {
        it("should success", function (done) {
            request(url)
                .post("/books/" + book_id_inserted + "/addCategory")
                .send({category: "CAT"})
                .set('Authorization', users[0].token)
                .expect(response.HTTP_CREATED)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("insertId");
                    done();
                });
        });

        it("should fail (unique (book_id/category))", function (done) {
            request(url)
                .post("/books/" + book_id_inserted + "/addCategory")
                .send({author: "CAT"})
                .set('Authorization', users[0].token)
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    describe("delete category", function () {
        it("should success", function (done) {
            request(url)
                .delete("/books/" + book_id_inserted + "/deleteCategory/CAT")
                .set('Authorization', users[0].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should fail (no match)", function (done) {
            request(url)
                .delete("/books/" + book_id_inserted + "/deleteCategory/CAT")
                .set('Authorization', users[0].token)
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

});

describe("Harcopy", function () {
    describe("create hardcopy", function () {
        it("should success", function (done) {
            request(url)
                .post('/hardcopies')
                .set('Authorization', users[1].token)
                .send(hardcopyData)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });

        });
    });

    describe("search", function () {
        it("should success (return book created)", function (done) {
            request(url)
                .get("/hardcopies?isbn10=" + isbn10)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.not.be.empty;
                    hardcopy_id_inserted = res.body[0].id;
                    done();
                });
        });
    });

    describe("get_specific_hardcopy", function () {
        it("should return hardcopy created", function (done) {
            request(url)
                .get('/hardcopies/' + hardcopy_id_inserted)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body[0].id.should.eql(hardcopy_id_inserted);
                    done();
                });
        });
    });

    describe("update hardcopy created", function () {
        it("should success (action)", function (done) {
            request(url)
                .put('/hardcopies/' + hardcopy_id_inserted)
                .send({state: 'Updated', location_id: 1})
                .set('Authorization', users[0].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });
        });

        it("should success(data updated)", function (done) {
            request(url)
                .get('/hardcopies/' + hardcopy_id_inserted)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body[0].state.should.eql("Updated");
                    done();
                });
        });
    });

    describe("get_account_hardcopies", function () {
        it("should return at least hardcopies created", function (done) {
            request(url)
                .get('/users/hardcopies')
                .set('Authorization', users[1].token)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.not.be.empty;
                    done();
                });
        });
    });

    describe("delete hardcopy created", function () {
        it("should success", function (done) {
            request(url)
                .delete('/hardcopies/' + hardcopy_id_inserted)
                .set('Authorization', users[0].token)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });
        });
    });
});

// TEST reservation/borrow queue
describe("TEST Reservation/Borrow queue", function () {
    describe("Connect accounts and create hardcopies", function () {
        it("connect user #2", function (done) {
            request(url)
                .post('/login')
                .send(users[2].log)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("token");
                    res.body.type_account.should.be.exactly("User");
                    users[2].token = res.body.token;
                    done();
                });
        });
        it("connect user #3", function (done) {
            request(url)
                .post('/login')
                .send(users[3].log)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("token");
                    res.body.type_account.should.be.exactly("User");
                    users[3].token = res.body.token;
                    done();
                });
        });
        it("connect user #4", function (done) {
            request(url)
                .post('/login')
                .send(users[4].log)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.have.property("token");
                    res.body.type_account.should.be.exactly("User");
                    users[4].token = res.body.token;
                    done();
                });
        });

        it("create hardcopy #1", function (done) {
            request(url)
                .post('/hardcopies')
                .set('Authorization', users[1].token)
                .send(hardcopyData)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });

        });


        it("create hardcopy #2", function (done) {
            request(url)
                .post('/hardcopies')
                .set('Authorization', users[1].token)
                .send(hardcopyData)
                .expect(response.HTTP_OK)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });

        });
    });

    describe("Reserve all users", function () {
        // Reservation 1-> 5
        it("reserve user #0", function (done) {
            reserve(0, response.HTTP_OK, done);
        });
        it("reserve user #1", function (done) {
            reserve(1, response.HTTP_OK, done);
        });
        it("reserve user #2", function (done) {
            reserve(2, response.HTTP_OK, done);
        });
        it("reserve user #3", function (done) {
            reserve(3, response.HTTP_OK, done);
        });
        it("reserve user #4", function (done) {
            reserve(4, response.HTTP_OK, done);
        });
    });

    describe("Get queue_order", function () {
        it("#0 = 0", function (done) {
            get_reservations(0, 0, done);
        });
        it("#1 = 0", function (done) {
            get_reservations(1, 0, done);
        });
        it("#2 = 1", function (done) {
            get_reservations(2, 1, done);
        });
        it("#3 = 2", function (done) {
            get_reservations(3, 2, done);
        });
        it("#4 = 3", function (done) {
            get_reservations(4, 3, done);
        });
    });

    describe("Cancel reservation #3", function () {
        it("cancel reservation #3", function (done) {
            cancel_reservation(3, done)
        });
        it("queue_order: #4 = 2", function (done) {
            get_reservations(4, 2, done);
        });
    });

    describe("Cancel reservation #1", function () {
        it("cancel reservation #1", function (done) {
            cancel_reservation(1, done)
        });
        it("queue_order: #2 = 0", function (done) {
            get_reservations(2, 0, done);
        });
        it("queue_order: #4 = 1", function (done) {
            get_reservations(4, 1, done);
        });
    });

    describe("Reserve #0", function () {
        it("should fail (already reserved)", function (done) {
            reserve(0, response.HTTP_SERV_GENERIC_ERROR, done)
        });
    });

    describe("Borrow #1", function () {
        it("should fail (hardcopies unavailable)", function (done) {
            borrow(1, response.HTTP_SERV_GENERIC_ERROR, done);
        });
    });

    describe("Borrow #0 #2", function () {
        it("should success #0", function (done) {
            borrow(0, response.HTTP_OK, done);
        });
        it("should success #2", function (done) {
            borrow(2, response.HTTP_OK, done);
        });
    });

    describe("Return #0 #2", function () {
        it("should success #0", function (done) {
            return_borrow(0, done);
        });
        it("should success #2", function (done) {
            return_borrow(2, done);
        });
        it("queue_order #4 = 0", function (done) {
            get_reservations(4, 0, done);
        });
        it("cancel reservation #4", function (done) {
            cancel_reservation(4, done);
        });
    });

    describe("get_account_borrows", function () {
        it("should not return empty body", function (done) {
            request(url)
                .get('/users/borrows')
                .set('Authorization', users[1].token)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.not.be.empty;
                    done()
                });
        });
    });

    describe("Borrow/Return #1", function () {
        it("borrow should fail (bad location)", function (done) {
            request(url)
                .post("/books/" + book_id_inserted + "/borrows")
                .set('Authorization', users[1].token)
                .send({book_id: book_id_inserted, location_id: 2})
                .expect(response.HTTP_SERV_GENERIC_ERROR)
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }
                    done()
                });
        });
        it("borrow should success", function (done) {
            borrow(1, response.HTTP_OK, done);
        });
        it("return should success", function (done) {
            return_borrow(1, done);
        });
    });

    describe("get_account_history_borrows", function () {
        it("should not return empty body", function (done) {
            request(url)
                .get("/users/history/borrows")
                .set('Authorization', users[1].token)
                .expect(response.HTTP_OK)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.body.should.not.be.empty;
                    done()
                });
        });
    });
});

function reserve(user_id, code, done) {
    return request(url)
        .post("/books/" + book_id_inserted + "/reservations")
        .set('Authorization', users[user_id].token)
        .send({book_id: book_id_inserted})
        .expect(code)
        .end(function (err) {
            if (err) {
                return done(err);
            }
            done()
        });
}

function get_reservations(user_id, queue_order, done) {
    return request(url)
        .get("/users/reservations")
        .set('Authorization', users[user_id].token)
        .expect(response.HTTP_OK)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }
            res.body[0].queue_order.should.eql(queue_order);
            done()
        });
}

function cancel_reservation(user_id, done) {
    return request(url)
        .delete("/books/" + book_id_inserted + "/reservations")
        .expect(response.HTTP_OK)
        .set('Authorization', users[user_id].token)
        .end(function (err) {
            if (err) {
                return done(err);
            }
            done()
        });
}

function borrow(user_id, code, done) {
    request(url)
        .post("/books/" + book_id_inserted + "/borrows")
        .set('Authorization', users[user_id].token)
        .send({book_id: book_id_inserted, location_id: 1})
        .expect(code)
        .end(function (err) {
            if (err) {
                return done(err);
            }
            done()
        });
}

function return_borrow(user_id, done) {
    return request(url)
        .put("/books/" + book_id_inserted + "/borrows")
        .set('Authorization', users[user_id].token)
        .send({location_id: 1})
        .expect(response.HTTP_OK)
        .end(function (err) {
            if (err) {
                return done(err);
            }
            done()
        });
}
