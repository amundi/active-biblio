import argparse
import sys
import os
import logging

from biblio.commands.BookCommand import BookCommand
from biblio.commands.AccountCommand import AccountCommand
from biblio.commands.HardcopyCommand import HardcopyCommand
import biblio.io.config as config

logger = logging.getLogger(__name__)


def init_logger():
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.CRITICAL)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(handler)


def clear_screen():
    if sys.platform.startswith('win'):
        os.system('cls')
    else:
        os.system('clear')


def parse_args():
    parser = argparse.ArgumentParser()

    subparsers = parser.add_subparsers(help='sub-command help')
    parser_books = subparsers.add_parser('book', help='books options')
    parser_books.add_argument('action')
    parser_books.add_argument('-a', '--author', dest='author', nargs='+', type=str)
    parser_books.add_argument('-c', '--category', dest='category', nargs='+', type=str)
    parser_books.add_argument('-C', '--comment', dest='comment_text', type=str)
    parser_books.add_argument('-CI', '--comment-id', dest='comment_id', type=int)
    parser_books.add_argument('-d', '--description', dest='description', type=str)
    parser_books.add_argument('-i', '--book-id', dest='book_id')
    parser_books.add_argument('-I10', '--isbn10', dest='isbn10', type=int)
    parser_books.add_argument('-I13', '--isbn13', dest='isbn13', type=int)
    parser_books.add_argument('-L', '--language', dest='language', type=str)
    parser_books.add_argument('-l', '--location', dest='location', type=str)
    parser_books.add_argument('-p', '--publisher', dest='publisher', type=str)
    parser_books.add_argument('-P', '--published_date', dest='published_date', type=int)
    parser_books.add_argument('-Pa', '--pages', dest='pages', type=int)
    parser_books.add_argument('-Ph', '--photo', dest='photo')
    parser_books.add_argument('-r', '--rate', dest='rate')
    parser_books.add_argument('-Rl', '--borrow-days-limit', dest='borrow_days_limit', type=int)
    parser_books.add_argument('-t', '--title', dest='title', type=str)
    parser_books.set_defaults(func=BookCommand().execute)

    parser_hardcopies = subparsers.add_parser('hardcopy', help='hardcopies options')
    parser_hardcopies.add_argument('action')
    parser_hardcopies.add_argument('-A', '--account-id', dest='account_id', type=int)
    parser_hardcopies.add_argument('-a', '--author', dest='author', nargs='+', type=str)
    parser_hardcopies.add_argument('-c', '--category', dest='category', nargs='+', type=str)
    parser_hardcopies.add_argument('-d', '--description', dest='description', type=str)
    parser_hardcopies.add_argument('-i', '--hardcopy-id', dest='hardcopy_id')
    parser_hardcopies.add_argument('-I10', '--isbn10', dest='isbn10', type=int)
    parser_hardcopies.add_argument('-I13', '--isbn13', dest='isbn13', type=int)
    parser_hardcopies.add_argument('-L', '--language', dest='language', type=str)
    parser_hardcopies.add_argument('-l', '--location', dest='location', type=str)
    parser_hardcopies.add_argument('-Pa', '--pages', dest='pages', type=int)
    parser_hardcopies.add_argument('-P', '--published_date', dest='published_date', type=int)
    parser_hardcopies.add_argument('-p', '--publisher', dest='publisher', type=str)
    parser_hardcopies.add_argument('-Rl', '--borrow-days-limit', dest='borrow_days_limit', type=int)
    parser_hardcopies.add_argument('-s', '--state', dest='state', type=str)
    parser_hardcopies.add_argument('-t', '--title', dest='title', type=str)
    parser_hardcopies.set_defaults(func=HardcopyCommand().execute)

    parser_accounts = subparsers.add_parser('account', help='accounts options')
    parser_accounts.add_argument('action')
    parser_accounts.add_argument('-CI', '--comment-id', dest='comment_id', type=int)
    parser_accounts.add_argument('-i', '--account-id', dest='account_id')
    parser_accounts.add_argument('-Lb', '--location-building', dest='location_building')
    parser_accounts.add_argument('-Lf', '--location-floor', dest='location_floor')
    parser_accounts.add_argument('-Lr', '--location-room', dest='location_room')
    parser_accounts.add_argument('-Li', '--location-id', dest='location_id', type=int)
    parser_accounts.set_defaults(func=AccountCommand().execute)

    return parser.parse_args()


def main():
    init_logger()

    home_dir = config.get_home_dir()
    logger.debug("Path = " + home_dir)

    args = parse_args()
    function_to_exec = args.func
    args_action = args.action
    args_dict = vars(args)
    args_dict.pop('func', 0)  # Removes the func entry
    args_dict.pop('action', 0)  # Removes the action entry
    function_to_exec(args_action, args_dict)


if __name__ == "__main__":
    main()
