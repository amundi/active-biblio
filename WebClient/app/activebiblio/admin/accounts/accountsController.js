'use strict';

var app = angular.module('routeAppControllers');

app.controller('accountsController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {
        $scope.initView = function () {
            $scope.accounts = {};
            $http({
                url: $rootScope.url + '/admin/accounts',
                method: 'GET',
                params: []
            })
                .success(function (accounts) {
                    $scope.accounts = accounts;
                })
                .error(function () {
                    alert("Account loading failed");
                });
        };

        //Lock/Unlock account
        $scope.lockAccount = function (account) {

            //Can't handle an admin account
            if (angular.equals(account.type, "Admin")) {
                alert("You can't handle an admin account");
            }
            else {
                //Check if the account is locked or available
                var action = angular.equals(account.state, "Locked") ? "unlock" : "lock";

                $http({
                    url: $rootScope.url + '/admin/accounts/' + account.id + '/' + action,
                    method: 'PUT',
                    params: []
                })
                    .success(function () {
                        alert('Account ' + action + 'ed');
                        $scope.initView();
                    })
                    .error(function (error) {
                        alert(error.text);
                    });
            }
        };

        $scope.initView();
    }]);
