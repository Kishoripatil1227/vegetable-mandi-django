"""Pure unit tests: run with `python manage.py test` (no database needed)."""
import math
import unittest
from datetime import date

from api import utils


class NumberHelpers(unittest.TestCase):
    def test_num_behaves_like_js_number(self):
        self.assertEqual(utils.num(None), 0)
        self.assertEqual(utils.num(""), 0)
        self.assertEqual(utils.num("12.5"), 12.5)
        self.assertTrue(math.isnan(utils.num("abc")))

    def test_is_positive(self):
        self.assertTrue(utils.is_positive(0.1))
        self.assertFalse(utils.is_positive(0))
        self.assertFalse(utils.is_positive(-3))
        self.assertFalse(utils.is_positive(float("nan")))

    def test_js_round_rounds_half_up(self):
        self.assertEqual(utils.js_round(2.5), 3)
        self.assertEqual(utils.js_round(3.5), 4)
        self.assertEqual(utils.js_round(-2.5), -2)


class MoneyCalculations(unittest.TestCase):
    def test_auction_total_and_commission(self):
        # 100 kg at Rs 20 = 2000, 6% commission = 120
        self.assertEqual(utils.calc_auction(100, 20, 6), (2000.0, 120.0))

    def test_auction_rounds_to_paise(self):
        total, commission = utils.calc_auction(33.33, 17.5, 6)
        self.assertEqual(total, 583.28)
        self.assertEqual(commission, 35.0)

    def test_net_payable(self):
        self.assertEqual(utils.calc_net_payable(2000, 120), 1880.0)


class Validation(unittest.TestCase):
    def test_phone(self):
        self.assertTrue(utils.PHONE_RE.match("9876543210"))
        self.assertFalse(utils.PHONE_RE.match("98765"))
        self.assertFalse(utils.PHONE_RE.match("98765abcde"))

    def test_email(self):
        self.assertTrue(utils.EMAIL_RE.match("a@b.co"))
        self.assertFalse(utils.EMAIL_RE.match("not-an-email"))

    def test_valid_date(self):
        self.assertTrue(utils.valid_date("2026-10-17"))
        self.assertFalse(utils.valid_date("2026-13-40"))
        self.assertFalse(utils.valid_date("17-10-2026"))
        self.assertFalse(utils.valid_date(""))


class Misc(unittest.TestCase):
    def test_lot_number_format(self):
        self.assertEqual(utils.make_lot_no(date(2026, 10, 17), 4321), "LOT-20261017-4321")

    def test_page_args_are_safe(self):
        self.assertEqual(utils.page_args({}), (1, 10, 0))
        self.assertEqual(utils.page_args({"page": "3"}), (3, 10, 20))
        self.assertEqual(utils.page_args({"page": "-5", "size": "abc"}), (1, 10, 0))
        self.assertEqual(utils.page_args({"size": "5000"})[1], 100)


if __name__ == "__main__":
    unittest.main()
