'use strict';

var app = angular.module('routeAppControllers');

app.controller('advancedSearchController', ['$scope', '$state', 'searchService',
    function ($scope, $state, searchService) {
        $scope.search = function () {
            var fields = {
                isbn10: $scope.isbn10,
                isbn13: $scope.isbn13,
                title: $scope.title,
                publisher: $scope.publisher,
                published_date: $scope.published_date,
                language: $scope.language,
                author: $scope.author,
                category: $scope.category
            };

            if (!hasNonEmptyProperties(fields)) {
                event.preventDefault();
                alert("No search parameters");
            }
            else {
                searchService.set(fields);
                $state.go("books");
            }
        };
    }]);

function hasNonEmptyProperties(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key]) {
            return true;
        }
    }
    return false;
};
