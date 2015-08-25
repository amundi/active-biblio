'use strict';

var app = angular.module('routeAppControllers');

app.controller('addBookController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {

        $scope.authors = [];
        $scope.categories = [];

        $scope.add = function () {

            var book = {
                isbn10: $scope.isbn10,
                isbn13: $scope.isbn13,
                title: $scope.title,
                publisher: $scope.publisher,
                published_date: $scope.published_date,
                language: $scope.language,
                description: $scope.description,
                pages: $scope.pages,
                photo: $scope.photo,
                author: $scope.authors,
                category: $scope.categories
            };

            $http({
                url: $rootScope.url + "/books",
                method: 'POST',
                data: book
            })
                .success(function () {
                    alert("Book added");
                })
                .error(function (message) {
                    alert(message.error);
                });
        };

        $scope.addAuthor = function (name) {
            if (name) {
                $scope.authors.push(name);
            }
        };
        $scope.deleteAuthor = function (id) {
            $scope.authors.splice(id, 1);
        };
        $scope.addCategory = function (name) {
            if (name) {
                $scope.categories.push(name);
            }
        };
        $scope.deleteCategory = function (id) {
            $scope.categories.splice(id, 1);
        };
    }]);