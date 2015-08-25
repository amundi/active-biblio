'use strict';

var app = angular.module('routeAppControllers');

app.controller('listBookController', ['$scope', '$http', '$rootScope', '$state', 'searchService', 'likeService',
    'favoriteService', function ($scope, $http, $rootScope, $state, searchService, likeService, favoriteService) {
        $scope.initView = function () {
            $http({
                url: $rootScope.url + '/books',
                method: 'GET',
                params: searchService.get()
            })
                .success(function (books) {
                    $scope.books = books;

                    for (var key in $scope.books) {
                        favoriteService.is_book_favorited($scope.books[key]);
                        likeService.is_book_liked($scope.books[key]);
                    }
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.like = function (book) {
            likeService.like(book.id, book.is_liked, function (result) {
                if (result) {
                    $scope.initView();
                }
            });
        };

        $scope.favorite = function (book) {
            favoriteService.favorite(book.id, book.is_favorited, function (result) {
                if (result) {
                    $scope.initView();
                }
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
