angular.module('starter.controllers', [])
    .controller('loginController', function ($scope, $rootScope, $http, $window, $ionicPopup) {

        $scope.init = function () {
            $scope.logged = $window.sessionStorage.token != null;
        };

        $scope.login = function (mail, password) {
            var log = {
                mail: mail,
                password: password
            };

            $http({
                url: $rootScope.url + "/login",
                method: 'POST',
                data: log
            })
                .success(function (data) {
                    $window.sessionStorage.token = data.token;
                    $window.sessionStorage.type = data.type_account;
                    $window.location.href = '#/app/';
                    $scope.init();
                })
                .error(function (message) {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: message.error
                    });
                    delete $window.sessionStorage.token;
                });

        };

        $scope.logout = function () {
            delete $window.sessionStorage.token;
            delete $window.sessionStorage.type;
            $scope.init();
        };

        $scope.init();
    })

    .controller('settingsController', function ($scope, $rootScope, $http, $window, $ionicPopup, $translate) {
        $scope.initView = function () {
            $http({
                url: $rootScope.url + '/locations',
                method: 'GET'
            })
                .success(function (locations) {
                    $scope.locations = locations;

                    //Set select location default
                    for (var key in locations) {
                        if (locations[key].id == $window.sessionStorage.location_id) {
                            $scope.locations.updatedLocation = locations[key];
                        }
                    }
                })
                .error(function () {
                    $ionicPopup.alert({
                        title: 'Error',
                        template: 'Locations loading failed'
                    });
                });
        };
        $scope.changeLoc = function () {
            if($window.sessionStorage.type == "Admin") {
                $window.sessionStorage.location_id = $scope.locations.updatedLocation.id;
                $ionicPopup.alert({
                    title: 'Success',
                    template: 'Location has been modified'
                });
            }
            else {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Only admin can modify locations'
                });
            }
        };

        $scope.changeLanguage = function (key) {
          $translate.use(key);
        };

        $scope.initView();
    })

    .controller('activitiesController', function ($scope, $rootScope, $http, $window, $ionicPopup, $cordovaBarcodeScanner) {
        $scope.initView = function () {
            if (!$window.sessionStorage.token) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'You have to login'
                });
                $window.location.href = '#/app/login';

            }
            else {
                $scope.isbn = $rootScope.isbn;

              //Search by google books API
                if ($scope.isbn) {
                    var googleAPI = $rootScope.urlGoogleAPI + $scope.isbn;

                    $.getJSON(googleAPI, function (response) {
                        if (response.totalItems != 0) {
                            var book = response.items[0].volumeInfo;

                            $scope.book = {
                                title: book.title,
                                publisher: book.publisher,
                                published_date: book.publishedDate,
                                language: book.language,
                                description: book.description,
                                pages: book.pageCount,
                                photo: book.imageLinks ? book.imageLinks.thumbnail : null,
                                author: book.authors,
                                category: book.categories
                            };

                            for (var i in book.industryIdentifiers) {
                                book.industryIdentifiers[i].type == 'ISBN_10'
                                    ? $scope.book['isbn10'] = book.industryIdentifiers[i].identifier
                                    : $scope.book['isbn13'] = book.industryIdentifiers[i].identifier;
                            }

                            $scope.$apply();
                        }
                        else {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Book not found'
                            });
                        }
                    });
                }
            }
        };

        $scope.searchBook = function () {
            $rootScope.isbn = $scope.isbn;
            $scope.initView();
        };

        $scope.scanBook = function () {

            $cordovaBarcodeScanner.scan().then(function (imageData) {
                $rootScope.isbn = imageData.text;
                $scope.initView();
                $window.location.href = '#/app/activities';
             }, function () {
                $ionicPopup.alert({
                    title: 'Error',
                    template: "Scan fail"
                });
             });
        };

        $scope.addHardcopy = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirmation',
                template: 'Are you sure you want to add this book? Please verify the correctness of the ISBN.'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $scope.book['location_id'] = $window.sessionStorage.location_id;

                  //Set table with user entries authors/categories if unknown
                  if(typeof ($scope.book.author) == "string") {
                    $scope.book.author = $scope.book.author.split(", ");
                  }
                  if(typeof ($scope.book.category) == "string") {
                    $scope.book.category = $scope.book.category.split(", ");
                  }

                    $http({
                        url: $rootScope.url + "/hardcopies",
                        method: 'POST',
                        data: $scope.book
                    })
                        .success(function () {
                            $ionicPopup.alert({
                                title: 'Success',
                                template: 'Book added'
                            });
                        })
                        .error(function (message) {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: message.error
                            });
                        });
                }
            });
        };

        $scope.rent = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirm rental',
                template: 'Are you sure you want to rent this book?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    //Search + Rent
                    $http({
                        url: $rootScope.url + '/books',
                        method: 'GET',
                        params: {
                          isbn10: $scope.book.isbn10,
                          isbn13: $scope.book.isbn13
                        }
                    })
                        .success(function (book) {
                            if (book.length == 0) {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Book not in DB'
                                });
                            }
                            else {
                                var data = {
                                    book_id: book[0].id,
                                    location_id: $window.sessionStorage.location_id
                                };

                                $http({
                                    url: $rootScope.url + "/books/" + book[0].id + "/rentals",
                                    method: 'POST',
                                    data: data
                                })
                                    .success(function () {
                                        $ionicPopup.alert({
                                            title: 'Success',
                                            template: 'Book available, you can pick it up'
                                        });
                                    })
                                    .error(function (message) {
                                        $ionicPopup.alert({
                                            title: 'Error',
                                            template: message.error
                                        });
                                    });
                            }
                        })
                        .error(function () {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Book not in DB'
                            });
                        });
                }
            });
        };

        $scope.return = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirm return ',
                template: 'Are you sure you want to return this book?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    //Search + Return
                    $http({
                        url: $rootScope.url + '/books',
                        method: 'GET',
                        params: {
                          isbn10: $scope.book.isbn10,
                          isbn13: $scope.book.isbn13
                        }
                    })
                        .success(function (book) {
                            if (book.length == 0) {
                                $ionicPopup.alert({
                                    title: 'Error',
                                    template: 'Book not in DB'
                                });
                            }
                            else {
                                var data = {
                                    location_id: $window.sessionStorage.location_id
                                };

                                $http({
                                    url: $rootScope.url + "/books/" + book[0].id + "/rentals",
                                    method: 'PUT',
                                    data: data
                                })
                                    .success(function () {
                                        $ionicPopup.alert({
                                            title: 'Success',
                                            template: 'You can return the book'
                                        });
                                        $scope.initView();
                                    })
                                    .error(function (message) {
                                        $ionicPopup.alert({
                                            title: 'Error',
                                            template: message.error
                                        });
                                    });
                            }
                        })
                        .error(function () {
                            $ionicPopup.alert({
                                title: 'Error',
                                template: 'Book not in DB'
                            });
                        });
                }
            });
        }
    });
