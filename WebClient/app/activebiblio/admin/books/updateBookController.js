'use strict';

var app = angular.module('routeAppControllers');

app.controller('updateBookController', ['$scope', '$http', '$rootScope', '$stateParams',
    function ($scope, $http, $rootScope, $stateParams) {
        $scope.initView = function () {
            $http({
                url: $rootScope.url + '/books/' + $stateParams.id,
                method: 'GET',
                params: []
            })
                .success(function (result) {
                    $scope.result = result[0];

                    $scope.book = {
                        isbn10: $scope.result.isbn10,
                        isbn13: $scope.result.isbn13,
                        title: $scope.result.title,
                        publisher: $scope.result.publisher,
                        published_date: $scope.result.published_date,
                        language: $scope.result.language,
                        description: $scope.result.description,
                        pages: $scope.result.pages,
                        photo: $scope.result.photo,
                        rental_days_limit: $scope.result.rental_days_limit,
                        author: $scope.result.Authors[0].name.split(','),
                        category: $scope.result.Categories[0] ?
                            $scope.result.Categories[0].name.split(',') : null
                    };

                })
                .error(function () {
                    alert("Book loading failed");
                });
        };

        $scope.update = function () {
            $http({
                url: $rootScope.url + '/books/' + $stateParams.id,
                method: 'PUT',
                data: $scope.book
            })
                .success(function () {
                    alert("Book updated");
                    $scope.initView();
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.addAuthor = function (name) {
            if (name) {
                $http({
                    url: $rootScope.url + "/books/" + $stateParams.id + "/addAuthor",
                    method: 'POST',
                    data: {author: name}
                })
                    .success(function () {
                        alert("Author added");
                        $scope.initView();
                    })
                    .error(function (message) {
                        alert(message.error);
                    });
            }
        };

        $scope.deleteAuthor = function (author) {
            $http({
                url: $rootScope.url + "/books/" + $stateParams.id + "/deleteAuthor/" + author,
                method: 'DELETE'
            })
                .success(function () {
                    alert("Author deleted");
                    $scope.initView();
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.addCategory = function (name) {
            if (name) {
                $http({
                    url: $rootScope.url + "/books/" + $stateParams.id + "/addCategory",
                    method: 'POST',
                    data: {category: name}
                })
                    .success(function () {
                        alert("Category added");
                        $scope.initView();
                    })
                    .error(function (message) {
                        alert(message.error);
                    });
            }
        };

        $scope.deleteCategory = function (category) {
            $http({
                url: $rootScope.url + "/books/" + $stateParams.id + "/deleteCategory/" + category,
                method: 'DELETE'
            })
                .success(function () {
                    alert("Category deleted");
                    $scope.initView();
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.initView();
    }]);