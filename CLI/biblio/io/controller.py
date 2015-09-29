from requests import Request, Session

from biblio.io import config
import biblio.helpers as helpers

TIMEOUT = 2


def auth():
    return "admin@admin.com", "youshallnotpass"


def get_current_borrows():
    return get("users/borrows")


def get_history_borrows():
    return get("users/history/borrows")


def get_added_hardcopies():
    return get("users/hardcopies")


def get_reservations():
    return get("users/reservations")


def get_favorites():
    return get("users/favorites")


def get_all_accounts():
    return get("admin/accounts")


def lock_account(account_id):
    return put("admin/accounts/{0}/lock".format(account_id))


def unlock_account(account_id):
    return put("admin/accounts/{0}/unlock".format(account_id))


def search_hardcopy(args):
    return get("hardcopies/", args)


def create_hardcopy(args, hardcopy_details):
    datas = {}
    for detail in hardcopy_details:
        if args[detail]:
            datas.update({detail: args[detail]})
    return post("hardcopies/", data=datas)


def delete_hardcopy(hardcopy_id):
    return delete("hardcopies/{0}".format(hardcopy_id))


def update_hardcopy(args, hardcopy_details):
    datas = {}
    for detail in hardcopy_details:
        if args[detail]:
            datas.update({detail: args[detail]})
    return put("hardcopies/{0}".format(args['hardcopy_id']), data=datas)


def get_available_hardcopies(book_id):
    return get("books/{0}/hardcopiesAvailable".format(book_id))


def get_comments(book_id):
    return get("books/{0}/comments".format(book_id))


def search_book(args):
    return get("books/", args)


def get_book_details(book_id):
    return get("books/{0}".format(book_id))


def get_hardcopy(hardcopy_id):
    return get("hardcopies/{0}".format(hardcopy_id))


def create_book(args, book_details):
    datas = {}
    for detail in book_details:
        if args[detail]:
            datas.update({detail: args[detail]})
    return post("books/", datas)


def comment_book(book_id, comment):
    return post("books/{0}/comments".format(book_id), data={'comment_text': comment})


def favorite_book(book_id):
    return post("books/{0}/favorite".format(book_id))


def remove_favorite_book(book_id):
    return delete("books/{0}/favorite".format(book_id))


def like_book(book_id):
    return post("books/{0}/like".format(book_id))


def dislike_book(book_id):
    return delete("books/{0}/like".format(book_id))


def rate_book(book_id, rate):
    return put("books/{0}/rate".format(book_id), data={'mark': rate})


def is_liked_book(book_id):
    return get("books/{0}/like".format(book_id))


def is_rated_book(book_id):
    return get("books/{0}/rate".format(book_id))


def is_favorited_book(book_id):
    return get("books/{0}/favorite".format(book_id))


def reserve_book(book_id):
    return post("books/{0}/reservations".format(book_id))


def cancel_book_reservation(book_id):
    return delete("books/{0}/reservations/".format(book_id))


def borrow_book(book_id, location):
    return post("books/{0}/borrows".format(book_id), data={'location': location})


def return_book(book_id, location):
    return put("books/{0}/borrows/".format(book_id), data={'location': location})


def update_book(args, book_details):
    datas = {}
    for detail in book_details:
        if args[detail]:
            datas.update({detail: args[detail]})
    return put("books/{0}".format(args['book_id']), data=datas)


def delete_comment(book_id, comment_id):
    return delete("books/{0}/comments/{1}".format(book_id, comment_id))


def add_author(book_id, author_id):
    return post("books/{0}/addAuthor".format(book_id), data={'author': author_id})


def delete_author(book_id, author_id):
    return delete("books/{0}/deleteAuthor/{1}".format(book_id, author_id[0]))


def add_category(book_id, id_category):
    return post("books/{0}/addCategory".format(book_id), data={'category': id_category})


def delete_category(book_id, category_id):
    return delete("books/{0}/deleteCategory/{1}".format(book_id, category_id[0]))


def get_locations():
    return get("locations")


def add_location(location_building, location_floor, location_room):
    return post("location", data={'location': [location_building, location_floor, location_room]})


def delete_location(location_id):
    return delete("location/{0".format(location_id))


def make_request(method, route, params={}, data={}):
    url = config.URL + route
    resp = None
    s = Session()
    req = Request(method, url, auth=auth(), params=params, data=data)
    prepped = req.prepare()
    if not config.is_debug_mode_activated:
        resp = s.send(prepped, timeout=TIMEOUT, verify=True)
        helpers.dump_pretty_response(resp)
    else:
        helpers.print_requests_content(req.method, config.URL, prepped)
    return resp, req


def get(route, params={}):
    return make_request(method="GET", route=route, params=params)


def post(route, data={}):
    return make_request(method="POST", route=route, data=data)


def put(route, data={}):
    return make_request(method="PUT", route=route, data=data)


def delete(route):
    return make_request(method="DELETE", route=route)
