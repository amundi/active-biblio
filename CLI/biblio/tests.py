import unittest

import biblio.io.controller as controller
import biblio.io.config as config

__author__ = 'P1kachu'


class Tests(unittest.TestCase):
    def test_get_route_well_crafted(self):
        args = {'test1': 'value1', 'test 2': 'value 2'}
        _, req = controller.get("route/", args)

        self.assertTrue(
            req.prepare().path_url in ('/route/?test+2=value+2&test1=value1', '/route/?test1=value1&test+2=value+2'))

    def test_post_route_well_crafted(self):
        data = {'test1': 'value1', 'test 2': 'value 2'}
        _, req = controller.post("route/", data)

        self.assertEqual(req.prepare().path_url, '/route/')
        self.assertEqual(req.data, data)


if __name__ == "__main__":
    config.is_debug_mode_activated = True
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(Tests)
    unittest.TextTestRunner().run(suite)
    config.is_debug_mode_activated = False
