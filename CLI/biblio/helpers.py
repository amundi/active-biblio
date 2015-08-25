import json


def is_query_success(response):
    return response.status_code // 10 == 20


def printplus(obj):
    """
    Pretty-prints the object passed in.

    """
    # Dict
    if isinstance(obj, dict):
        for k, v in sorted(obj.items()):
            print(u'{0}: {1}'.format(k, v))

    # List or tuple
    elif isinstance(obj, list) or isinstance(obj, tuple):
        for x in obj:
            print(x)

    # Other
    else:
        print(obj)


def pretty_listing(text, indent_count):
    """
    Pretty prints an element, with indentation to allow
     a quick list building
    """
    print("  " * indent_count + text)


def print_requests_content(request_type, url, prepped):
    print("{0} {1}{2}".format(request_type, url, prepped.path_url[1:]))
    printplus(prepped.headers)
    if prepped.body:
        print("Body: {0}".format(prepped.body))


def convert_unicode(dump):
    dump = dump.replace(u"\u2018", "'")
    dump = dump.replace(u"\u2019", "'")
    dump = dump.replace(u"\u201c", "\"")
    dump = dump.replace(u"\u201d", "\"")
    dump = dump.replace(u"\u2015", "-")
    return dump.replace(u"\u2014", "-")


def dump_pretty_response(response):
    if is_query_success(response):
        try:
            print(convert_unicode(json.dumps(response.json(), indent=4, ensure_ascii=False)))
        except Exception:
            print("SUCCESS (code: {0})".format(response.status_code))
    else:
        print("ERROR (code: {0}) - {1}".format(response.status_code, response.text))
