'use strict';

var app = angular.module('routeAppControllers');

app.controller('favoritesController', ['$scope', '$http', '$rootScope', '$state', 'favoriteService',
    function ($scope, $http, $rootScope, $state, favoriteService) {
        $scope.initView = function () {

            $http({
                url: $rootScope.url + '/users/favorites',
                method: 'GET'
            })
                .success(function (favorites) {
                    $scope.favorites = favorites;
                })
                .error(function () {
                    alert("Favorites loading failed");
                });
        };

        $scope.unfavorite = function (book_id) {
            favoriteService.favorite(book_id, true, function (result) {
                result
                    ? $scope.initView()
                    : alert("Couldn't remove this book to favorites");
            });
        };

        $scope.reserve = function (book_id) {
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
