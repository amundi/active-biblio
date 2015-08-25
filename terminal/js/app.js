angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'starter.config', 'pascalprecht.translate'])

    .run(function ($ionicPlatform, $rootScope, config) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }

            $rootScope.url = config.server_url;
            $rootScope.urlGoogleAPI = config.googleAPI;
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $translateProvider) {
        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/app.html'
            })

            .state('app.scan', {
                url: '/scan',
                views: {
                    'scan': {
                        templateUrl: 'templates/scan.html',
                        controller: 'scanController'
                    }
                }
            })

            .state('app.activities', {
                url: '/activities',
                views: {
                    'activities': {
                        templateUrl: 'templates/activities.html',
                        controller: 'activitiesController'
                    }
                }
            })

            .state('app.login', {
                url: '/login',
                views: {
                    'login': {
                        templateUrl: 'templates/login.html',
                        controller: 'loginController'
                    }
                }
            })

            .state('app.settings', {
                url: '/settings',
                views: {
                    'settings': {
                        templateUrl: 'templates/settings.html',
                        controller: 'settingsController'
                    }
                }
            });

        $urlRouterProvider.otherwise('/app/login');

        // Translation
        $translateProvider.useStaticFilesLoader({
          prefix: 'angular-translate/i18n/messages_',
          suffix: '.json'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.fallbackLanguage('en');

        $httpProvider.interceptors.push('authRequestService');

    });
