'use strict';

var app = angular.module('routeAppControllers');

app.controller('booksManagerController', ['$scope', '$http', '$rootScope', '$state',
    function ($scope, $http, $rootScope, $state) {


        $scope.init = function () {
            $scope.type = "books";
            $scope.states = ['Available', 'Reserved', 'Rented', 'Unavailable'];

            $http({
                url: $rootScope.url + '/locations',
                method: 'GET'
            })
                .success(function (locations) {
                    $scope.locations = locations;
                })
                .error(function () {
                    alert("Locations loading failed");
                });
        };

        $scope.search = function () {
            $scope.type_selected = $scope.type;
            var fields = {
                isbn10: $scope.isbn10,
                isbn13: $scope.isbn13,
                title: $scope.title,
                publisher: $scope.publisher,
                published_date: $scope.published_date,
                language: $scope.language,
                author: $scope.author,
                category: $scope.category,
                location_id: $scope.locations.selectedLocation ? $scope.locations.selectedLocation.id : null,
                state: $scope.states.updated
            };

            if (!hasNonEmptyProperties(fields)) {
                event.preventDefault();
                alert("No search parameters");
            }
            else {
                $http({
                    url: $rootScope.url + '/' + $scope.type,
                    method: 'GET',
                    params: fields
                })
                    .success(function (results) {
                        $scope.results = results;
                    })
                    .error(function (message) {
                        alert(message.error);
                    });
            }
        };

        $scope.addBook = function () {
            $state.go("admin.addBook");
        };

        $scope.update = function (id) {
            $state.go("admin.update." + $scope.type, {id: id});
        };

        $scope.addHardcopy = function (result) {
            if ($scope.locations.addedLocation) {
                var data = result;
                data['author'] = data.Authors[0].name.split(", ");
                data['category'] = data.Categories[0].name.split(", ");
                data.location_id = $scope.locations.addedLocation.id;

                $http({
                    url: $rootScope.url + '/hardcopies',
                    method: 'POST',
                    data: data
                })
                    .success(function () {
                        alert("Hardcopy added");
                    })
                    .error(function (message) {
                        alert(message.error);
                    });
            }
            else {
                alert("Choose a location");
            }

        };

        $scope.delete = function (hardcopy_id) {
            $http({
                url: $rootScope.url + '/' + $scope.type + '/' + hardcopy_id,
                method: 'DELETE'
            })
                .success(function () {
                    alert("Hardcopy deleted");
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.init();
    }]);


function hasNonEmptyProperties(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key]) {
            return true;
        }
    }
    return false;
};