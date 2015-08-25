from abc import abstractmethod


class ArgumentError(Exception):
    def __init__(self, message):
        self.message = message


class BaseCommand:
    def __init__(self, entity_name):
        self.entity_name = entity_name

    def execute(self, action_name, args):
        action = self.get_action(action_name)
        if action:
            try:
                action(args)
            except ArgumentError as e:
                print('Error: missing argument\nUsage: {} {} {}'.format(
                    self.entity_name, action_name, e.message))
        else:
            self.print_help()

    @staticmethod
    def require(self, *args, **kwargs):
        if not all(args):
            raise ArgumentError(kwargs['help'])

    @abstractmethod
    def get_action(self, action):
        return lambda action: None

    @abstractmethod
    def print_help(self):
        pass
