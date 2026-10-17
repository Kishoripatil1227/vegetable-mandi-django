# ER Diagram

Tables used by the application. Columns listed are the ones the code reads or writes.
Check against the Supabase Table Editor before submitting, the database can have extra columns.

```mermaid
erDiagram
    PROFILES ||--o{ AUDIT_LOGS : "performs"
    PROFILES ||--o| BUYERS : "linked customer"
    FARMERS ||--o{ PRODUCE_LOTS : "supplies"
    VEGETABLES ||--o{ PRODUCE_LOTS : "is of"
    PRODUCE_LOTS ||--o| WEIGHMENTS : "weighed in"
    PRODUCE_LOTS ||--o| AUCTIONS : "sold in"
    BUYERS ||--o{ AUCTIONS : "buys"
    AUCTIONS ||--o| COMMISSIONS : "earns"
    PRODUCE_LOTS ||--o| SETTLEMENTS : "paid by"
    FARMERS ||--o{ SETTLEMENTS : "receives"
    VEGETABLES ||--o{ PRICE_HISTORY : "has"

    PROFILES {
        uuid id PK
        text full_name
        text phone
        text role "admin, staff, customer"
        text requested_role
    }
    FARMERS {
        uuid id PK
        text name
        text phone "unique, 10 digits"
        text village
        text bank_account
        text status "active, inactive"
    }
    BUYERS {
        uuid id PK
        text name
        text phone
        text status
        uuid user_id FK
    }
    VEGETABLES {
        uuid id PK
        text name
        text unit
    }
    PRODUCE_LOTS {
        uuid id PK
        text lot_no "LOT-YYYYMMDD-NNNN"
        uuid farmer_id FK
        uuid vegetable_id FK
        numeric quantity
        date lot_date
        text status "received, weighed, auctioned, settled"
        uuid created_by FK
    }
    WEIGHMENTS {
        uuid id PK
        uuid lot_id FK
        numeric gross_weight
        numeric tare_weight
        numeric net_weight "calculated"
        uuid weighed_by FK
    }
    AUCTIONS {
        uuid id PK
        uuid lot_id FK
        uuid buyer_id FK
        numeric rate_per_kg
        numeric total_amount
        date auction_date
        uuid created_by FK
    }
    COMMISSIONS {
        uuid id PK
        uuid auction_id FK
        numeric percent
        numeric commission_amount
    }
    SETTLEMENTS {
        uuid id PK
        uuid lot_id FK
        uuid farmer_id FK
        numeric gross_amount
        numeric commission_amount
        numeric net_payable
        text payment_status "pending, paid"
        date paid_date
        uuid finalized_by FK
    }
    PRICE_HISTORY {
        uuid id PK
        uuid vegetable_id FK
        date rate_date
        numeric avg_rate
        text source
    }
    APP_SETTINGS {
        text key PK
        text value
    }
    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        text action
        text table_name
        text record_id
        jsonb details
        timestamptz created_at
    }
```

## Lot status flow

`received` -> (weighment) -> `weighed` -> (auction + commission) -> `auctioned` -> (admin finalizes settlement) -> `settled`
