
PRAGMA foreign_keys=OFF;

BEGIN TRANSACTION;

CREATE TABLE Location(
        id INTEGER PRIMARY KEY,
        building varchar(100) DEFAULT NULL,
        floor int unsigned DEFAULT NULL,
        room varchar(100) DEFAULT NULL,

        UNIQUE (building, floor, room)
);

CREATE TABLE VoteType(
        id INTEGER PRIMARY KEY,
        name varchar(100) NOT NULL,

        UNIQUE (name)
);

CREATE TABLE Account (
        id INTEGER PRIMARY KEY,
        email varchar(255) NOT NULL,
        type varchar(50) NOT NULL DEFAULT 'User',
        state varchar(50) NOT NULL DEFAULT 'Available',
        last_login_date timestamp DEFAULT NULL
);

CREATE TABLE Book (
        id INTEGER PRIMARY KEY,
        isbn10 varchar(10) NOT NULL,
        isbn13 varchar(13) NOT NULL,
        title varchar(255) NOT NULL,
        publisher varchar(255) DEFAULT NULL,
        published_date Year NOT NULL,
        language varchar(50) NOT NULL,
        description text(4096) DEFAULT NULL,
        pages int NOT NULL,
        photo text(2048) DEFAULT NULL,
        borrow_days_limit int NOT NULL,

        UNIQUE (isbn10),
        UNIQUE (isbn13)
);

CREATE TABLE Author (
        id INTEGER PRIMARY KEY,
        book_id int unsigned NOT NULL,
        name varchar(100) NOT NULL,

        FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
        UNIQUE (book_id, name)
);

CREATE TABLE Category (
        id INTEGER PRIMARY KEY,
        book_id int unsigned NOT NULL,
        name varchar(100) NOT NULL,

        FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
        UNIQUE (book_id, name)
);

CREATE TABLE Hardcopy (
        id INTEGER PRIMARY KEY,
        book_id int unsigned NOT NULL,
        account_id int unsigned NOT NULL,
        location_id int unsigned NOT NULL,
        state varchar(50) NOT NULL DEFAULT 'Available',
        added_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES Location(id) ON DELETE CASCADE
);

CREATE TABLE Borrow (
        id INTEGER PRIMARY KEY,
        account_id int unsigned NOT NULL,
        hardcopy_id int unsigned,
        book_id int unsigned NOT NULL,
        borrow_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        return_date timestamp DEFAULT NULL,

        FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE,
        FOREIGN KEY (hardcopy_id) REFERENCES Hardcopy(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES Book(id) ON DELETE CASCADE
);

CREATE TABLE Reservation (
        id INTEGER PRIMARY KEY,
        book_id int unsigned DEFAULT NULL,
        account_id int unsigned NOT NULL,
        reservation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reservation_deadline timestamp DEFAULT NULL,
        queue_order int NOT NULL,
        reservation_hardcopy_id int unsigned DEFAULT NULL,
        reservation_hardcopy_location_id int unsigned DEFAULT NULL,

        FOREIGN KEY (book_id) REFERENCES Book(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE,
        FOREIGN KEY (reservation_hardcopy_id) REFERENCES Hardcopy(id) ON DELETE CASCADE,
        FOREIGN KEY (reservation_hardcopy_location_id) REFERENCES Location(id) ON DELETE CASCADE
);

CREATE TABLE Rate(
        id INTEGER PRIMARY KEY,
        account_id int unsigned NOT NULL,
        book_id int unsigned NOT NULL,
        mark int unsigned,

        FOREIGN KEY (account_id) REFERENCES Account (id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
        UNIQUE (account_id,book_id)
);

CREATE TABLE Vote(
        id INTEGER PRIMARY KEY,
        account_id int unsigned NOT NULL,
        book_id int unsigned NOT NULL,
        votetype_id int unsigned NOT NULL,
        added_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (account_id) REFERENCES Account (id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
    FOREIGN KEY (votetype_id) REFERENCES VoteType (id) ON DELETE CASCADE,
    UNIQUE (account_id, book_id, votetype_id)
);

CREATE TABLE Comment(
        id INTEGER PRIMARY KEY,
        account_id int unsigned NOT NULL,
        book_id int unsigned NOT NULL,
        comment_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        comment_text text(4096) NOT NULL,

        FOREIGN KEY (account_id) REFERENCES Account (id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE
);

-- INSERT
INSERT INTO "VoteType" VALUES(1,'Like');
INSERT INTO "VoteType" VALUES(2,'Favorite');

COMMIT;
