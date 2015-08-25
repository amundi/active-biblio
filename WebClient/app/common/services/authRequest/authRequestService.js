angular.module('ActiveBiblio')
    .factory('authRequestService', function ($window) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    config.headers.Authorization = $window.sessionStorage.token;
                }
                return config;
            },
            response: function (response) {
                return response;
            }
        };
    });