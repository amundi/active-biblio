'use strict';

var app = angular.module('routeAppControllers');

app.controller('borrowsController', ['$scope', '$http', '$rootScope', '$state',
    function ($scope, $http, $rootScope, $state) {

        $scope.initView = function () {
            $scope.currentBorrows = {};
            $http({
                url: $rootScope.url + '/users/borrows',
                method: 'GET'
            })
                .success(function (currentBorrows) {
                    $scope.currentBorrows = currentBorrows;
                })
                .error(function () {
                    alert("Current borrows loading failed");
                });

            $scope.borrowsHistory = {};
            $http({
                url: $rootScope.url + '/users/history/borrows',
                method: 'GET'
            })
                .success(function (borrowsHistory) {
                    $scope.borrowsHistory = borrowsHistory;
                })
                .error(function () {
                    alert("Borrows History loading failed");
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

        $scope.return = function (borrow) {
            if ($scope.locations.selectedLocation) {
                var data = {
                    location_id: $scope.locations.selectedLocation.id
                };

                $http({
                    url: $rootScope.url + "/books/" + borrow.Book.id + "/borrows",
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
