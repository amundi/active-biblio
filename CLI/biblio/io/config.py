import os.path

COMPANY_NAME = "COMPANY"
PROGRAM_NAME = "active_biblio"
URL = "http://localhost:8090/"

_config_file = '.active_biblio'
_config_backup = '~/.active_biblio'
is_debug_mode_activated = False


def get_home_dir():
    return os.path.expanduser("~")
