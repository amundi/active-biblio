angular.module('ActiveBiblio')
    .factory('likeService', function ($rootScope, $http) {

        function like(id, like, callback) {
            var action = like ? "DELETE" : "POST";

            $http({
                url: $rootScope.url + "/books/" + id + "/like",
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

        function is_book_liked(book) {
            $http({
                url: $rootScope.url + '/books/' + book.id + '/like',
                method: 'GET'
            })
                .success(function (is_liked) {
                    book['is_liked'] = is_liked.length;
                })
                .error(function () {
                    book['is_liked'] = false;
                });
        }

        return {
            like: like,
            is_book_liked: is_book_liked
        }
    });