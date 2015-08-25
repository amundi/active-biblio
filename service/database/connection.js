var Sequelize = require("sequelize");
var response = require('../response');
var config = require('../config');

if(process.env.is_test) {
    config.config = config.configTest;
}

exports.Sequelize = Sequelize;
exports.sequelize =
    new Sequelize(config.config.database, config.config.username, config.config.password, config.config.connect);
