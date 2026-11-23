A shelter **gives out** animals (`IShelter<T>`), and a vet **takes in** animals (`IVet<T>`). The program does not compile yet: `Main` treats a vet for any animal as a vet for dogs, and passes a dog shelter where a shelter of animals is expected.

1. Make the two interfaces variant, so that both conversions in `Main` become legal. Decide which of them is `out` and which is `in`.
2. Write `AdoptAll(IShelter<Animal> shelter, int count)`: it adopts `count` animals from the shelter and returns them in a list, in the order of adoption.

Do not change `Main` or the classes. Expected output:

```text
Treating Rex1: Woof
Treating Rex2: Woof
Treating Rex3: Woof
Treating Tom: Meow
```

Hint: a type parameter that appears only as a return value can be `out`; one that appears only as a parameter can be `in`.
