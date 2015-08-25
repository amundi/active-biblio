var database = require('./connection');

var Sequelize = database.Sequelize;
var sequelize = database.sequelize;

var Location = sequelize.define('Location', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    building: {type: Sequelize.STRING(100), allowNull: false},
    floor: {type: Sequelize.INTEGER, allowNull: false},
    room: {type: Sequelize.STRING(100), allowNull: false}
}, {timestamps: false, freezeTableName: true});

var VoteType = sequelize.define('VoteType', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {type: Sequelize.STRING(100), allowNull: false}
}, {timestamps: false, freezeTableName: true});

var Account = database.sequelize.define('Account', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {type: Sequelize.STRING(255), allowNull: false},
    type: {type: Sequelize.STRING(10), allowNull: false, defaultValue: 'User'},
    state: {type: Sequelize.STRING(10), allowNull: false, defaultValue: 'Available'},
    last_login_date: Sequelize.DATE
}, {timestamps: false, freezeTableName: true});


var Book = sequelize.define('Book', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    isbn10: {type: Sequelize.STRING(10), allowNull: false},
    isbn13: {type: Sequelize.STRING(13), allowNull: false, defaultValue: 'User'},
    title: {type: Sequelize.STRING(255), allowNull: false, defaultValue: 'Available'},
    publisher: Sequelize.STRING(255),
    published_date: {type: Sequelize.INTEGER, allowNull: false},
    language: {type: Sequelize.STRING(50), allowNull: false},
    description: Sequelize.TEXT,
    pages: {type: Sequelize.INTEGER, allowNull: false},
    photo: Sequelize.TEXT,
    rental_days_limit: {type: Sequelize.INTEGER, allowNull: false}
}, {timestamps: false, freezeTableName: true});

var Author = sequelize.define('Author', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {type: Sequelize.STRING(255), allowNull: false}
}, {timestamps: false, freezeTableName: true});
Book.hasMany(Author, {foreignKey: 'book_id'});

var Category = sequelize.define('Category', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {type: Sequelize.STRING(255), allowNull: false}
}, {timestamps: false, freezeTableName: true});
Book.hasMany(Category, {foreignKey: 'book_id'});

var Hardcopy = sequelize.define('Hardcopy', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    state: {type: Sequelize.STRING(50), allowNull: false, defaultValue: 'Available'},
    added_date: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW}
}, {timestamps: false, freezeTableName: true});
Book.hasMany(Hardcopy, {foreignKey: 'book_id'});
Hardcopy.belongsTo(Book, {foreignKey: 'book_id'});
Account.hasMany(Hardcopy, {foreignKey: 'account_id'});
Hardcopy.belongsTo(Account, {foreignKey: 'account_id'});
Location.hasMany(Hardcopy, {foreignKey: 'location_id'});
Hardcopy.belongsTo(Location, {foreignKey: 'location_id'});

var Rental = sequelize.define('Rental', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rental_date: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW},
    return_date: Sequelize.DATE
}, {timestamps: false, freezeTableName: true});
Account.hasMany(Rental, {foreignKey: 'account_id'});
Rental.belongsTo(Account, {foreignKey: 'account_id', constraints: false});
Hardcopy.hasMany(Rental, {foreignKey: 'hardcopy_id', constraints: false});
Book.hasMany(Rental, {foreignKey: 'book_id'});
Rental.belongsTo(Book, {foreignKey: 'book_id', constraints: false});

var Reservation = sequelize.define('Reservation', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reservation_date: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW},
    reservation_deadline: Sequelize.DATE,
    queue_order: {type: Sequelize.INTEGER, allowNull: false}
}, {timestamps: false, freezeTableName: true});
Book.hasMany(Reservation, {foreignKey: 'book_id', constraints: false});
Reservation.belongsTo(Book, {foreignKey: 'book_id', constraints: false});
Account.hasMany(Reservation, {foreignKey: 'account_id'});
Reservation.belongsTo(Account, {foreignKey: 'account_id', constraints: false});
Hardcopy.hasMany(Reservation, {foreignKey: 'reservation_hardcopy_id', constraints: false});
Location.hasMany(Reservation, {foreignKey: 'reservation_hardcopy_location_id'});
Reservation.belongsTo(Location, {foreignKey: 'reservation_hardcopy_location_id', constraints: false});

var Rate = sequelize.define('Rate', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mark: Sequelize.INTEGER
}, {timestamps: false, freezeTableName: true});
Account.hasMany(Rate, {foreignKey: 'account_id'});
Book.hasMany(Rate, {foreignKey: 'book_id'});

var Vote = sequelize.define('Vote', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    added_date: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW}
}, {timestamps: false, freezeTableName: true});
Account.hasMany(Vote, {foreignKey: 'account_id'});
Book.hasMany(Vote, {foreignKey: 'book_id'});
Vote.belongsTo(Book, {foreignKey: 'book_id'});
VoteType.hasMany(Vote, {foreignKey: 'votetype_id'});

var Comment = sequelize.define('Comment', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    comment_date: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW},
    comment_text: {type: Sequelize.TEXT, allowNull: false}
}, {timestamps: false, freezeTableName: true});
Account.hasMany(Comment, {foreignKey: 'account_id'});
Comment.belongsTo(Account, {foreignKey: 'account_id'});
Book.hasMany(Comment, {foreignKey: 'book_id'});

var Reputation = sequelize.define('Reputation', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    score: Sequelize.INTEGER
}, {timestamps: false, freezeTableName: true});
Account.hasOne(Reputation, {foreignKey: 'account_id'});

exports.Location = Location;
exports.VoteType = VoteType;
exports.Account = Account;
exports.Book = Book;
exports.Author = Author;
exports.Category = Category;
exports.Hardcopy = Hardcopy;
exports.Rental = Rental;
exports.Reservation = Reservation;
exports.Rate = Rate;
exports.Vote = Vote;
exports.Comment = Comment;
exports.Reputation = Reputation;