Code talks to Dataverse with logical names, and the Web API with entity set names. Write the helper that turns a display name into all of them.

The maker portal builds a schema name by removing the spaces from the display name and adding the publisher prefix. Many teams go one step further and use **PascalCase**, so names stay readable. Implement that convention in the class `Names`:

- `SchemaName(displayName, prefix)`: split the display name into words at spaces, hyphens, underscores and dots; make the **first letter of each word upper case** and keep the rest as it is; join the words and put `prefix + "_"` in front. `"Credit Score"` → `contoso_CreditScore`.
- `LogicalName(displayName, prefix)`: the schema name in **lower case**. `"Credit Score"` → `contoso_creditscore`.
- `EntitySetName(displayName, prefix)`: the plural of the logical name, used in Web API URLs, with a simplified English rule: ending in `y` → replace it with `ies`; ending in `s` → add `es`; otherwise add `s`.

Do not change `Main`. Expected output:

```text
Tables:
  Project -> contoso_Project | contoso_project | contoso_projects
  Delivery Address -> contoso_DeliveryAddress | contoso_deliveryaddress | contoso_deliveryaddresses
  Company -> contoso_Company | contoso_company | contoso_companies
  Business Process -> contoso_BusinessProcess | contoso_businessprocess | contoso_businessprocesses
Columns:
  Credit Score -> new_CreditScore | new_creditscore
  ERP customer code -> new_ERPCustomerCode | new_erpcustomercode
  e-mail 2 -> new_EMail2 | new_email2
```

Notice that the entity set name is only printed for tables: columns have no URL of their own.

Hint: `displayName.Split(new[] { ' ', '-', '_', '.' }, StringSplitOptions.RemoveEmptyEntries)` gives the words, `char.ToUpperInvariant(word[0]) + word.Substring(1)` capitalises one, and `ToLowerInvariant()` and `EndsWith()` do the rest.
