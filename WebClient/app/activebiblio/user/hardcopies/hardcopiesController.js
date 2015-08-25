'use strict';

var app = angular.module('routeAppControllers');

app.controller('hardcopiesController', ['$scope', '$http', '$rootScope', '$state',
    function ($scope, $http, $rootScope, $state) {

        $scope.initView = function () {
            $scope.addedHardcopies = {};
            $http({
                url: $rootScope.url + '/users/hardcopies',
                method: 'GET'
            })
                .success(function (addedHardcopies) {
                    $scope.addedHardcopies = addedHardcopies;
                })
                .error(function () {
                    alert("Hardcopies added loading failed");
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

        $scope.go = function (book_id) {
            $state.go("booksDetails", {id: book_id});
        };

        $scope.initView();
    }]);
