Implement the heart of the record-level security check yourself.

The program has a business unit tree, users with the **depth of their Read privilege** on account, and account records with an owner and a list of users the record is shared with:

```text
Contoso
├── Sales
│   └── Sales West
└── Service
```

A record's owning business unit is its owner's unit (`record.Owner.Unit`). Write `Security.CanRead(user, record)`:

- **None**: the user cannot read any record, **even one shared with them**: sharing extends access only for users who have the privilege at least at User level.
- A record **shared with the user** (`record.SharedWith`) can be read with any other depth.
- **User**: only records the user owns.
- **BusinessUnit**: records owned in the user's own business unit.
- **ParentChild**: records owned in the user's unit or in any unit below it. Walk up from the owner's unit through `Parent` until you meet the user's unit or reach the root.
- **Organization**: every record.

Do not change `Main`. Expected output:

```text
Anna (User, Sales West): Acme, Globex
Bohdan (BusinessUnit, Sales): Initech
Chen (ParentChild, Sales): Acme, Globex, Initech
Dana (Organization, Service): Acme, Globex, Initech, Umbrella
Eva (None, Service): -
Ivan (User, Sales West): Globex
Oleh (ParentChild, Contoso): Acme, Globex, Initech, Umbrella
```

Check the interesting lines: Anna sees Globex only because Ivan shared it with her. Bohdan is in Sales with Business Unit depth, so Anna's and Ivan's records in Sales West are not his. Eva has Globex shared with her but no Read privilege at all. Oleh sits in the root unit with Parent: Child depth, which in practice equals Organization.

Hint: a `switch` on `user.ReadDepth` after the two early checks (None, then sharing) keeps it readable. Compare business units by reference: `unit == user.Unit`.
