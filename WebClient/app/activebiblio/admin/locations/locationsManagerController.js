'use strict';

var app = angular.module('routeAppControllers');

app.controller('locationsManagerController', ['$scope', '$http', '$rootScope',
    function ($scope, $http, $rootScope) {
        $scope.init = function () {
            $scope.type = "books";

            $http({
                url: $rootScope.url + '/locations',
                method: 'GET'
            })
                .success(function (locations) {
                    $scope.locations = locations;
                })
                .error(function () {
                    alert("Locations loading failed");
                });
        };
        $scope.add = function () {
            var data = {
                building: $scope.building,
                floor: $scope.floor,
                room: $scope.room
            };

            if (!hasNonEmptyProperties(data)) {
                event.preventDefault();
                alert("Incomplete parameters");
            }
            else {
                $http({
                    url: $rootScope.url + '/location',
                    method: 'POST',
                    data: data
                })
                    .success(function () {
                        alert("Location added");
                        $scope.init();
                    })
                    .error(function (message) {
                        alert(message.error);
                    });
            }
        };

        $scope.delete = function () {
            if ($scope.locations.selectedLocation) {
                $http({
                    url: $rootScope.url + '/location/' + $scope.locations.selectedLocation.id,
                    method: 'DELETE'
                })
                    .success(function () {
                        alert("Location deleted");
                        $scope.init();
                    })
                    .error(function (message) {
                        alert(message.error);
                    });
            }
            else {
                alert("Choose a location");
            }
        };

        $scope.init();
    }]);

function hasNonEmptyProperties(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key]) {
            return true;
        }
    }
    return false;
};