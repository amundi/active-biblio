'use strict';

var app = angular.module('routeAppControllers');

app.controller('rentalsController', ['$scope', '$http', '$rootScope', '$state',
    function ($scope, $http, $rootScope, $state) {

        $scope.initView = function () {
            $scope.currentRentals = {};
            $http({
                url: $rootScope.url + '/users/rentals',
                method: 'GET'
            })
                .success(function (currentRentals) {
                    $scope.currentRentals = currentRentals;
                })
                .error(function () {
                    alert("Current rentals loading failed");
                });

            $scope.historyRentals = {};
            $http({
                url: $rootScope.url + '/users/history/rentals',
                method: 'GET'
            })
                .success(function (historyRentals) {
                    $scope.historyRentals = historyRentals;
                })
                .error(function () {
                    alert("History rentals loading failed");
                });

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

        $scope.addReservation = function (book_id) {
            var data = {};
            $http({
                url: $rootScope.url + "/books/" + book_id + "/reservations",
                method: 'POST',
                data: data
            })
                .success(function () {
                    alert("Reservation added");
                    $scope.initView();
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.return = function (rental) {
            if ($scope.locations.selectedLocation) {
                var data = {
                    location_id: $scope.locations.selectedLocation.id
                };

                $http({
                    url: $rootScope.url + "/books/" + rental.Book.id + "/rentals",
                    method: 'PUT',
                    data: data
                })
                    .success(function () {
                        alert("Book returned");
                        $scope.initView();
                    })
                    .error(function (message) {
                        alert(message.error);
                    });
            }
            else {
                alert("Choose a location to return your book");
            }
        };


        $scope.go = function (book_id) {
            $state.go("booksDetails", {id: book_id});
        };

        $scope.initView();
    }]);
