# Test Cases

Automated: `cd backend && python manage.py test` (validation, access control, money calculations).
Manual cases below are for the live site and the final demo. Mark the result column when you run them.

| ID | Module | Steps | Expected | Result |
|---|---|---|---|---|
| TC-01 | Auth | Open `/login`, enter wrong password | "Invalid email or password" | |
| TC-02 | Auth | Sign up as Customer, then log in as Customer | Dashboard opens | |
| TC-03 | Auth | Sign up as Staff, log in as Staff before approval | Message that the request waits for admin approval | |
| TC-04 | Auth | Log in selecting a different role than the account has | "This account is not registered as ..." | |
| TC-05 | Auth | Forgot password, open the email link, set a new password | Can log in with the new password | |
| TC-06 | Roles | Staff opens `/roles` | Page not available / 403 from API | |
| TC-07 | Roles | Admin changes a user's role | Role updated, entry in audit log | |
| TC-08 | Roles | Admin tries to change their own role | "You cannot change your own role" | |
| TC-09 | Farmers | Add farmer with 9-digit phone | "Phone must be 10 digits" | |
| TC-10 | Farmers | Add the same phone twice | "Record already exists" | |
| TC-11 | Farmers | Search by name, village | Matching rows only | |
| TC-12 | Buyers | Add a buyer, link to a customer account | Customer sees own purchases on the dashboard | |
| TC-13 | Lots | Create lot with quantity 0 | "Quantity must be greater than 0" | |
| TC-14 | Lots | Create lot with farmer and vegetable | Lot no `LOT-YYYYMMDD-NNNN`, status Received | |
| TC-15 | Weighment | Gross 100, tare 3.5 on a received lot | Net 96.5, lot status Weighed | |
| TC-16 | Weighment | Tare greater than gross | "Gross weight must be greater than tare" | |
| TC-17 | Weighment | Weigh the same lot again | "Lot already weighed" | |
| TC-18 | Auction | Auction a lot that is not weighed | "Lot must be weighed first" | |
| TC-19 | Auction | Net 96.5 kg at Rs 20, commission 6% | Total 1930.00, commission 115.80, lot Auctioned | |
| TC-20 | Auction | Leave commission empty | Default commission from settings is used | |
| TC-21 | Settlement | Create settlement for the auctioned lot | Net payable = 1930.00 - 115.80 = 1814.20, status Pending | |
| TC-22 | Settlement | Staff tries to finalize | Not allowed (403) | |
| TC-23 | Settlement | Admin finalizes | Status Paid with date, lot Settled | |
| TC-24 | History | Filter by status and date range | Only matching lots, full chain visible on expand | |
| TC-25 | Reports | Choose a date range | Daily sales, commission, by-vegetable totals match the auctions | |
| TC-26 | Dashboard | After TC-14 to TC-23 | Counters and pipeline bar updated | |
| TC-27 | Settings | Admin changes default commission to 5 | Next auction without a percent uses 5 | |
| TC-28 | Audit | Open audit log as admin | Create, weigh, auction, settle actions listed with user | |
| TC-29 | Mobile | Open the live site on a phone | Pages readable, tables scroll sideways | |
| TC-30 | Deploy | Open `/api/health?db=1` on the backend URL | `{"ok": true, "db": true}` | |
