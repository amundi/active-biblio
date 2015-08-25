'use strict';

var app = angular.module('ActiveBiblio', [
            'ui.router',
            'routeAppControllers',
            'pascalprecht.translate',
            'active.config'
        ]
    ).config(function ($stateProvider, $urlRouterProvider, $translateProvider, $httpProvider) {
            $stateProvider

                .state('app', {
                    url: '/app',
                    templateUrl: 'app/app.html'
                })

                .state('user', {
                    abstract: true,
                    url: '/user',
                    template: '<ui-view/>'
                })

                .state('user.favorites', {
                    url: '/favorites',
                    templateUrl: 'app/activebiblio/user/favorites/favoritesView.html',
                    controller: 'favoritesController'
                })

                .state('user.rentals', {
                    url: '/rentals',
                    templateUrl: 'app/activebiblio/user/rentals/rentalsView.html',
                    controller: 'rentalsController'
                })

                .state('user.reservations', {
                    url: '/reservations',
                    templateUrl: 'app/activebiblio/user/reservations/reservationsView.html',
                    controller: 'reservationsController'
                })

                .state('user.hardcopies', {
                    url: '/hardcopies',
                    templateUrl: 'app/activebiblio/user/hardcopies/hardcopiesView.html',
                    controller: 'hardcopiesController'
                })

                .state('admin', {
                    abstract: true,
                    url: '/admin',
                    template: '<ui-view/>'
                })

                .state('admin.accounts', {
                    url: '/accounts',
                    templateUrl: 'app/activebiblio/admin/accounts/accountsView.html',
                    controller: 'accountsController'
                })

                .state('admin.locations', {
                    url: '/locations',
                    templateUrl: 'app/activebiblio/admin/locations/locationsManagerView.html',
                    controller: 'locationsManagerController'
                })

                .state('admin.books', {
                    url: '/books',
                    templateUrl: 'app/activebiblio/admin/books/booksManagerView.html',
                    controller: 'booksManagerController'
                })

                .state('admin.update', {
                    abstract: true,
                    url: '/update',
                    template: '<ui-view/>'
                })

                .state('admin.update.books', {
                    url: '/books/:id',
                    templateUrl: 'app/activebiblio/admin/books/updateBookView.html',
                    controller: 'updateBookController'
                })

                .state('admin.update.hardcopies', {
                    url: '/hardcopies/:id',
                    templateUrl: 'app/activebiblio/admin/books/updateHardcopyView.html',
                    controller: 'updateHardcopyController'
                })

                .state('admin.addBook', {
                    url: '/addBook',
                    templateUrl: 'app/activebiblio/admin/books/addBookView.html',
                    controller: 'addBookController'
                })

                .state('login', {
                    url: '/login',
                    templateUrl: 'app/common/controller/login/loginView.html',
                    controller: 'loginController'
                })

                .state('advancedSearch', {
                    url: '/advancedSearch',
                    templateUrl: 'app/common/controller/search/advancedSearchView.html',
                    controller: 'advancedSearchController'
                })

                .state('books', {
                    url: '/books',
                    templateUrl: 'app/activebiblio/books/listBookView.html',
                    controller: 'listBookController'
                })

                .state('booksDetails', {
                    url: '/books/:id',
                    templateUrl: 'app/activebiblio/books/bookDetailsView.html',
                    controller: 'bookDetailsController'
                });

            $urlRouterProvider.otherwise('/app');

            // Translation
            $translateProvider.useStaticFilesLoader({
                prefix: 'assets/angular-translate/i18n/messages_',
                suffix: '.json'
            });
            $translateProvider.preferredLanguage('en');
            $translateProvider.fallbackLanguage('en');

            $httpProvider.interceptors.push('authRequestService');
        })
    ;

app.run(function ($rootScope, $state, $window, config) {
    $rootScope.url = config.URL;
    $window.sessionStorage.type;
    $window.sessionStorage.token != null;

    //Redirection if not an admin or not logged
    $rootScope.$on('$stateChangeStart', function (e, toState) {
        if(toState.name === "login") {
            return;
        }
        else if($window.sessionStorage.token != null) {
            if(toState.name.indexOf("user") != -1) {
                return;
            }
            else if(toState.name.indexOf("admin") != -1) {
                if($window.sessionStorage.type === "Admin") {
                    return;
                }
                else {
                    alert("Only admin can go to this page");
                    e.preventDefault();
                    $state.go("app");
                }
            }
            else {
                return;
            }

        }
        else if(toState.name.indexOf("user") == -1 && toState.name.indexOf("admin") == -1)
        {
            return;
        }
        else {
            alert("You are not connected. Please log in");
            e.preventDefault();
            $state.go("login");
        }
    });
});

angular.module('routeAppControllers', []);
