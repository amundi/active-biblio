'use strict';

var app = angular.module('routeAppControllers');

app.controller('updateHardcopyController', ['$scope', '$http', '$rootScope', '$stateParams',
    function ($scope, $http, $rootScope, $stateParams) {
        $scope.initView = function () {
            $http({
                url: $rootScope.url + '/hardcopies/' + $stateParams.id,
                method: 'GET',
                params: []
            })
                .success(function (result) {
                    $scope.result = result[0];

                    $http({
                        url: $rootScope.url + '/locations',
                        method: 'GET'
                    })
                        .success(function (locations) {
                            $scope.locations = locations;

                            //Set select default
                            for (var key in locations) {
                                if (locations[key].id == $scope.result.Location.id) {
                                    $scope.locations.updatedLocation = locations[key];
                                }
                            }
                        })
                        .error(function () {
                            alert("Locations loading failed");
                        });

                    $scope.hardcopy = {
                        title: $scope.result.Book.title,
                        owner: $scope.result.Account.email
                    };

                    $scope.states = ['Available', 'Reserved', 'Rented', 'Unavailable'];
                    $scope.states.updated = $scope.result.state;
                })
                .error(function () {
                    alert("Hardcopy loading failed");
                });

        };

        $scope.update = function () {
            var data = {
                location_id: $scope.locations.updatedLocation.id,
                state: $scope.states.updated
            };

            $http({
                url: $rootScope.url + '/hardcopies/' + $stateParams.id,
                method: 'PUT',
                data: data
            })
                .success(function () {
                    alert("Hardcopy updated");
                    $scope.initView();
                })
                .error(function () {
                    alert("Couldn't update this hardcopy");
                });
        };
        $scope.initView();
    }]);