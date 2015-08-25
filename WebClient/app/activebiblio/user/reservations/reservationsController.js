'use strict';

var app = angular.module('routeAppControllers');

app.controller('reservationsController', ['$scope', '$http', '$rootScope', '$state',
    function ($scope, $http, $rootScope, $state) {

        $scope.initView = function () {
            $scope.reservations = {};
            $http({
                url: $rootScope.url + '/users/reservations',
                method: 'GET'
            })
                .success(function (reservations) {
                    $scope.reservations = reservations;
                })
                .error(function () {
                    alert("Reservation loading failed");
                });
        };

        $scope.deleteReservation = function (reservation_book_id) {
            $http({
                url: $rootScope.url + "/books/" + reservation_book_id + "/reservations",
                method: 'DELETE'
            })
                .success(function () {
                    alert("Reservation deleted");
                    $scope.initView();
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.rent = function (reservation) {
            var data = {
                book_id: reservation.Book.id,
                location_id: reservation.Location.id
            };

            $http({
                url: $rootScope.url + "/books/" + reservation.Book.id + "/rentals",
                method: 'POST',
                data: data
            })
                .success(function () {
                    alert("Book rented");
                    $scope.initView();
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.go = function (book_id) {
            $state.go("booksDetails", {id: book_id});
        };

        $scope.initView();
    }]);
