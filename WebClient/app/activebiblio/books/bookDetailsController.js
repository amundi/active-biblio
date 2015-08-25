'use strict';

var app = angular.module('routeAppControllers');

app.controller('bookDetailsController', ['$scope', '$http', '$window', '$rootScope', '$stateParams', 'likeService',
    'favoriteService', function ($scope, $http, $window, $rootScope, $stateParams, likeService, favoriteService) {
        $scope.initView = function () {
            $scope.book = {};
            $scope.comment = {};
            $scope.type = $window.sessionStorage.type;

            $http({
                url: $rootScope.url + '/books/' + $stateParams.id,
                method: 'GET',
                params: []
            })
                .success(function (book) {
                    $scope.book = book[0];
                    favoriteService.is_book_favorited($scope.book);
                    likeService.is_book_liked($scope.book);
                })
                .error(function () {
                    alert("Book loading failed");
                });

            $http({
                url: $rootScope.url + '/books/' + $stateParams.id + "/comments",
                method: 'GET',
                params: []
            })
                .success(function (comment) {
                    $scope.comments = comment;
                })
                .error(function () {
                    alert("Comments loading failed");
                });
        };

        $scope.like = function (book) {
            likeService.like(book.id, book.is_liked, function (result) {
                result
                    ? $scope.initView()
                    : alert("Couldn't like this book");
            });
        };

        $scope.favorite = function (book) {
            favoriteService.favorite(book.id, book.is_favorited, function (result) {
                result
                    ? $scope.initView()
                    : alert("Couldn't add this book to favorites");
            });
        };

        $scope.addComment = function () {
            var data = {comment_text: $scope.comment_box};
            $http({
                url: $rootScope.url + '/books/' + $stateParams.id + "/comments",
                method: 'POST',
                data: data
            })
                .success(function (message) {
                    $scope.initView();
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.deleteComment = function (comment_id) {
            $http({
                url: $rootScope.url + '/books/' + $stateParams.id + "/comments/" + comment_id,
                method: 'DELETE',
                params: []
            })
                .success(function (message) {
                    $scope.initView();
                })
                .error(function (message) {
                    alert(message.error);
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

        $scope.initView();
    }]);
