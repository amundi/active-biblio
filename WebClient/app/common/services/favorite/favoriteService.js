angular.module('ActiveBiblio')
    .factory('favoriteService', function ($rootScope, $http) {

        function favorite(id, favorite, callback) {
            var action = favorite ? "DELETE" : "POST";

            $http({
                url: $rootScope.url + "/books/" + id + "/favorite",
                method: action
            })
                .success(function () {
                    callback(true);
                })
                .error(function (message) {
                    alert(message.error);
                    callback(false);
                });
        }

        function is_book_favorited(book) {
            $http({
                url: $rootScope.url + '/books/' + book.id + '/favorite',
                method: 'GET'
            })
                .success(function (is_favorited) {
                    book['is_favorited'] = is_favorited.length;
                })
                .error(function () {
                    book['is_favorited'] = false;
                });
        }

        return {
            favorite: favorite,
            is_book_favorited: is_book_favorited
        }
    });