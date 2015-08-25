from biblio.commands.BaseCommand import BaseCommand

import biblio.helpers as helpers
from biblio.io import controller

HARDCOPIES_DETAILS = [
    "account_id",
    "author",
    "category",
    "description",
    "isbn10",
    "isbn13",
    "language",
    "location",
    "pages",
    "published_date",
    "publisher",
    "rental_days_limit",
    "state",
    "title"
]


class HardcopyCommand(BaseCommand):
    def __init__(self):
        self.actions = {
            # User and Admin options
            "search": self.search,
            "create": self.create,
            "get": self.get,
            # Admin options
            "update": self.update_hardcopy,
            "delete": self.delete_hardcopy
        }
        super(HardcopyCommand, self).__init__('hardcopy')

    def print_hardcopy_help(self):
        helpers.pretty_listing("hardcopy:", 0)
        for action in self.actions.keys():
            helpers.pretty_listing(action, 2)

    def require_hardcopy_id(self, args):
        self.require(args['hardcopy_id'], help='--hardcopy-id ID')

    def get_action(self, action):
        return self.actions[action]

    def search(self, args):
        controller.search_hardcopy(args)

    def create(self, args):
        controller.create_hardcopy(args, HARDCOPIES_DETAILS)

    def delete_hardcopy(self, args):
        self.require_hardcopy_id(args)
        controller.get_hardcopy(args['hardcopy_id'])

    def get(self, args):
        self.require_hardcopy_id(args)
        controller.delete_hardcopy(args['hardcopy_id'])

    def update_hardcopy(self, args):
        self.require_hardcopy_id(args)
        controller.update_hardcopy(args, HARDCOPIES_DETAILS)
