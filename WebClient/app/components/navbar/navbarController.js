'use strict';

var app = angular.module('routeAppControllers');

app.controller('navbarController', ['$scope', '$window', '$state', 'searchService', '$translate', '$state',
    function ($scope, $window, $state, searchService, $translate) {
        $scope.initView = function () {
            $scope.type = $window.sessionStorage.type;
            $scope.logged = $window.sessionStorage.token != null;
        };

        $scope.searchAll = function () {
            if($scope.search) {
                var table = {query: $scope.search};
                searchService.set(table);
                $state.go("books", {}, {reload: true});
            }
            else {
                alert("No search parameters");
            }

        };

        $scope.changeLanguage = function (key) {
            $translate.use(key);
        };

        $scope.logout = function () {
            delete $window.sessionStorage.token;
            delete $window.sessionStorage.type;
            $state.go("login");
            $scope.initView();
        };

        $scope.initView();
    }]);