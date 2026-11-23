Look at a class that stores a circle:

```csharp
class Circle
{
    public double Radius;
}

var c = new Circle();
c.Radius = -5;                               // compiles, and nobody complains
Console.WriteLine(Math.PI * c.Radius * c.Radius);    // 78.5...: the area of a circle that does not exist
```

A radius cannot be negative. The class knows this, but it has **no way to defend** the rule: any code in the program can write any number in the field, from any place, at any time. The object is now **broken**, and it does not know about it.

## Invariants

Most objects have rules that must **always** be true. They are called **invariants**:

- the radius of a circle is not negative;
- the balance of an account is not below the credit limit;
- the denominator of a fraction is not zero;
- the end of a segment is not before its start;
- the number of items in a list equals the number of items in its counter.

Data **integrity** means that these rules hold for **every object, at every moment**. The program is correct only when no object is ever in a state that breaks its invariants.

## Why it is hard

When any code can change the fields, the invariant is protected by **every place in the program at once**. Each new line that writes `Radius` must remember the rule. One forgotten check, and the object is broken. It is not a question of "if" but "when": in a program with thousands of lines, someone forgets.

Worse, the symptom appears **far** from the cause. The negative radius is written in one place, and the strange result shows up later in a completely different part of the program. The search for the bug starts from the wrong end.

## The idea of encapsulation

The solution is to **give the responsibility to the class**:

1. The fields are **hidden** inside the class, and the outside code cannot touch them.
2. The class offers **operations** (methods and properties) through which the data can be changed.
3. Every operation **checks the rules** and refuses to break them.

Then the invariant is guarded in **one** place: inside the class. All the code of the program can use the object without knowing the rules, and the object can never get into a bad state.

```csharp
class Circle
{
    private double radius;                   // hidden

    public Circle(double radius)             // the only way to create a circle
    {
        if (radius < 0) throw new ArgumentOutOfRangeException("radius");
        this.radius = radius;
    }

    public double Area() { return Math.PI * radius * radius; }
}
```

This is **encapsulation**: the data and the code that guards it are packed together in a class, and the inside is hidden. The next lectures show the tools: `private`, properties, constructors and `readonly`.

## A real-life picture

A car has an engine, and the driver does not touch the pistons. The driver uses the **pedals** and the **wheel**: a small, safe interface. The engine does not allow the driver to set the speed to 500 km/h by turning a screw. The details are hidden, and the rules of the machine are kept.
