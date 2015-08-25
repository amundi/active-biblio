var response = require ('./response');
var _ = require('underscore');

function check_nan_parameters(res, parameters) {
    return _.every(parameters, function(value, key) {
        if (!value) {
            response.send_error(res, "Parameter is missing: " + key);
        }
        else if (isNaN(value)) {
            response.send_error(res, key + " should be a number");
        }
        else {
            return value;
        }
    });
}

function check_undefined_parameters (res, parameters) {
    return _.every(parameters, function(value, key) {
        if (!value) {
            response.send_error(res, "Parameter is missing: " + key);
        }
        else {
            return value;
        }
    });
}

exports.check_nan_parameters = check_nan_parameters;
exports.check_undefined_parameters = check_undefined_parameters;