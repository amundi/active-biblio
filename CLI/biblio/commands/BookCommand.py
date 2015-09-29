from biblio.commands.BaseCommand import BaseCommand

import biblio.helpers as helpers
from biblio.io import controller

BOOK_DETAILS = [
    "author",
    "category",
    "description",
    "isbn10",
    "isbn13",
    "language",
    "pages",
    "published_date",
    "publisher",
    "photo",
    "borrow_days_limit",
    "title",
]


class BookCommand(BaseCommand):
    def __init__(self):
        self.actions = {
            # User and Admin options
            "search": self.search,
            "details": self.details,
            "create": self.create,
            "comment": self.comment,
            "favorite": self.favorite,
            "unfavorite": self.unfavorite,
            "is-favorited": self.is_favorited,
            "like": self.like,
            "dislike": self.dislike,
            "is-liked": self.is_liked,
            "rate": self.rate,
            "is-rated": self.is_rated,
            "reserve": self.reserve,
            "cancel-reservation": self.cancel_reservation,
            "borrow": self.borrow,
            "return": self.return_book,
            "available-hardcopies": self.get_available_hardcopies,
            "get-comments": self.get_comments,

            # Admin options
            "add-author": self.add_author,
            "add-category": self.add_category,
            "delete-author": self.delete_author,
            "delete-category": self.delete_category,
            "update": self.update_book,
            "delete-comment": self.delete_comment
        }
        super(BookCommand, self).__init__('book')

    def print_help(self):
        helpers.pretty_listing("book:", 0)
        for action in self.actions.keys():
            helpers.pretty_listing(action, 2)

    def require_book_id(self, args):
        self.require(args['book_id'], help='--entity-id ID')

    def get_action(self, action):
        return self.actions[action]

    def search(self, args):
        controller.search_book(args)

    def details(self, args):
        self.require_book_id(args)
        controller.get_book_details(args['book_id'])

    def create(self, args):
        controller.create_book(args, BOOK_DETAILS)

    def comment(self, args):
        self.require(args['book_id'], args['comment_text'], help='--entity-id ID -C comment_text')
        controller.comment_book(args['book_id'], args['comment_text'])

    def favorite(self, args):
        self.require_book_id(args)
        controller.favorite_book(args['book_id'])

    def unfavorite(self, args):
        self.require_book_id(args)
        controller.remove_favorite_book(args['book_id'])

    def is_favorited(self, args):
        self.require_book_id(args)
        controller.is_favorited_book(args['book_id'])

    def like(self, args):
        self.require_book_id(args)
        controller.like_book(args['book_id'])

    def dislike(self, args):
        self.require_book_id(args)
        controller.dislike_book(args['book_id'])

    def is_liked(self, args):
        self.require_book_id(args)
        controller.is_liked_book(args['book_id'])

    def rate(self, args):
        self.require_book_id(args)
        controller.rate_book(args['book_id'], args['rate'])

    def is_rated(self, args):
        self.require_book_id(args)
        controller.is_rated_book(args['book_id'])

    def reserve(self, args):
        self.require_book_id(args)
        controller.reserve_book(args['book_id'])

    def cancel_reservation(self, args):
        self.require_book_id(args)
        controller.cancel_book_reservation(args['book_id'])

    def borrow(self, args):
        self.require(args['book_id'], args['location'], help='--entity-id ID -l location')
        controller.borrow_book(args['book_id'], args['location'])

    def return_book(self, args):
        self.require(args['book_id'], args['location'],
                     help='--entity-id ID -l location')
        controller.return_book(args['book_id'], args['location'])

    def add_author(self, args):
        self.require(args['book_id'], args['author'], help='--entity-id ID -a author')
        controller.add_author(args['book_id'], args['author'])

    def delete_author(self, args):
        self.require(args['book_id'], args['author'], help='--entity-id ID -a author')
        controller.delete_author(args['book_id'], args['author'])

    def add_category(self, args):
        self.require(args['book_id'], args['category'], help='--entity-id ID -c category')
        controller.add_category(args['book_id'], args['category'])

    def delete_category(self, args):
        self.require(args['book_id'], args['category'], help='--entity-id ID -c category')
        controller.delete_category(args['book_id'], args['category'])

    def update_book(self, args):
        self.require_book_id(args)
        controller.update_book(args, BOOK_DETAILS)

    def delete_comment(self, args):
        self.require(args['book_id'], args['comment_id'], help='--entity-id ID -CI comment_ID')
        controller.delete_comment(args['book_id'], args['comment_id'])

    def get_available_hardcopies(self, args):
        self.require_book_id(args)
        controller.get_available_hardcopies(args['book_id'])

    def get_comments(self, args):
        self.require_book_id(args)
        controller.get_comments(args['book_id'])
