'use strict';

var app = angular.module('routeAppControllers');

app.controller('loginController', function ($scope, $rootScope, $http, $window, $state) {
    $scope.login = function () {
        var log = {
            mail: $scope.mail,
            password: $scope.password
        };
        $http({
            url: $rootScope.url + "/login",
            method: 'POST',
            data: log
        })
            .success(function (data) {
                $window.sessionStorage.token = data.token;
                $window.sessionStorage.type = data.type_account;
                $window.location.reload();
                $state.go("app");
            })
            .error(function (message) {
                alert(message.error);
                delete $window.sessionStorage.token;
            });
    }
});