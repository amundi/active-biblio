var response = require('../response');
var util = require('../util');
var models = require('../database/models');

var Location = models.Location;
var Hardcopy = models.Hardcopy;

// Manage locations is a admin feature

function create(req, res) {
    var parameters = {
        building: req.body.building,
        floor: req.body.floor,
        room: req.body.room
    };

    if (util.check_undefined_parameters(res, parameters)) {
        Location.create(parameters)
            .then(function (insert_result) {
                response.send_success(res, insert_result.dataValues, response.query_action.INSERT);
            }).catch(function () {
                response.send_error(res, "Couldn't add this location");
            });
    }
}

// We can't delete a location where there are hardcopies
function delete_location(req, res) {
    var parameters = {
        id: req.params.id
    };

    if (util.check_nan_parameters(res, parameters)) {
        Hardcopy.findAll({
            where: {
                location_id: parameters['id']
            }
        })
            .then(function (harcopies) {
                if (harcopies.length != 0) {
                    response.send_error(res, "Couldn't delete this location : hardcopies are at this location");
                }
                else {
                    Location.destroy({
                        where: {
                            id: parameters['id']
                        }
                    })
                        .then(function (delete_result) {
                            response.send_success(res, delete_result, response.query_action.DELETE);
                        })
                        .catch(function () {
                            response.send_error(res, "Couldn't delete this location");
                        });
                }
            })
            .catch(function () {
                response.send_error(res, "Query failed");
            });
    }
}

function get_locations(res) {
    Location.findAll({})
        .then(function (locations) {
            response.send_success(res, locations, response.query_action.SELECT);
        })
        .catch(function () {
            response.send_error(res, "Query failed");
        });
}

exports.create = create;
exports.delete_location = delete_location;
exports.get_locations = get_locations;