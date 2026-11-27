Write two **shipping strategies** for a checkout.

`Checkout` holds an `IShippingStrategy` and adds its cost to the sum of the items. It doesn't know how shipping is calculated, and you won't change it. `PickupShipping` (free) is already written. Implement `Cost(weightKg)` in:

- **`PostShipping`**: 60 plus 10 for every kilogram;
- **`CourierShipping`**: 120 for parcels up to 5 kg inclusive; above that, 120 plus 20 for every kilogram over 5.

Do not change `Main` or `Checkout`. Expected output:

```text
Parcel 2 kg:
  Pickup: 1500
  Post: 1580
  Courier: 1620
Parcel 8 kg:
  Pickup: 1500
  Post: 1640
  Courier: 1680
```

Check the numbers: an 8 kg parcel by post is 60 + 80 = 140, so 1500 + 140 = 1640. By courier it's 120 + 3 × 20 = 180, so 1680.

Notice that adding a fourth way of shipping would be one more class and one more item in the array in `Main`, with no change to `Checkout`. That's the open/closed principle in action.
