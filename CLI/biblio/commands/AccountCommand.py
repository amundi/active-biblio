from biblio.commands.BaseCommand import BaseCommand

import biblio.helpers as helpers
from biblio.io import controller


class AccountCommand(BaseCommand):
    def __init__(self):
        self.actions = {
            # User and Admin options
            "current-rentals": self.current_rentals,
            "history-rentals": self.history_rentals,
            "added-hardcopies": self.added_hardcopies,
            "reservations": self.reservations,
            "favorites": self.get_favorites,
            "get-locations": self.get_locations,
            # Admin options
            "lock": self.lock,
            "unlock": self.unlock,
            "get-all": self.return_all_accounts,
            "get-locations": self.get_locations(),
            "add-location": self.add_location,
            "delete-location": self.delete_location
        }
        super(AccountCommand, self).__init__('account')

    def print_account_help(self):
        helpers.pretty_listing("account:", 0)
        for action in self.actions.keys():
            helpers.pretty_listing(action, 2)

    def get_action(self, action):
        return self.actions[action]

    def current_rentals(self, args):
        controller.get_current_rentals()

    def history_rentals(self, args):
        controller.get_history_rentals()

    def added_hardcopies(self, args):
        controller.get_added_hardcopies()

    def reservations(self, args):
        controller.get_reservations()

    def return_all_accounts(self, args):
        controller.get_all_accounts()

    def lock(self, args):
        self.require(args['account_id'], help='--account-id ID')
        controller.lock_account(args['account_id'])

    def unlock(self, args):
        self.require(args['account_id'], help='--account-id ID')
        controller.unlock_account(args['account_id'])

    def get_favorites(self, args):
        controller.get_favorites()

    def get_locations(self, args):
        controller.get_locations()

    def add_location(self, args):
        self.require(args['location_building'], args['location_floor'], args['location_room'],
                     help='--location location')
        controller.add_location(args['location_building'], args['location_floor'], args['location_room'])

    def delete_location(self, args):
        self.require(args['location_id'], help='--location-id ID')
        controller.delete_location(args['location_id'])
