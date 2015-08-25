angular.module('ActiveBiblio')
    .factory('searchService', function () {
        var searchValues = {};

        function set(data) {
            searchValues = data;
        }

        function get() {
            return searchValues;
        }

        return {
            set: set,
            get: get
        }
    });