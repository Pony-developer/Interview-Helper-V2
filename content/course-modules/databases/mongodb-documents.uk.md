MongoDB зберігає **документи**: JSON-подібні об'єкти, згруповані в **колекції**, які живуть у **базі даних**.

| Реляційна модель | MongoDB |
|---|---|
| База даних | База даних |
| Таблиця | Колекція |
| Рядок | Документ |
| Стовпець | Поле |
| Первинний ключ | `_id` |
| З'єднання | Вкладення або `$lookup` |
| Індекс | Індекс |

## Документи та BSON

```js
{
  _id: ObjectId("66a1f0c2e4b0a1b2c3d4e5f6"),
  name: "4K Monitor",
  category: "electronics",
  price: NumberDecimal("329.00"),
  tags: ["display", "bestseller"],
  specs: { size: 27, color: "black" },
  createdAt: ISODate("2024-06-01T10:00:00Z")
}
```

- Документи зберігаються як **BSON** (двійковий JSON), що додає типи, яких бракує JSON: дати, 32/64-бітні цілі, `Decimal128` (використовуйте для грошей), двійкові дані та `ObjectId`.
- Кожен документ має `_id`, унікальний у межах колекції. Типово драйвер генерує **ObjectId**: 12 байтів із часової позначки, випадкового значення й лічильника. Він приблизно впорядкований за часом, тож `_id` ще й підказує, коли документ створено.
- Поля можуть містити масиви та вкладені документи, тож один документ може представляти те, що в SQL було б кількома з'єднаними таблицями.
- Документ може мати щонайбільше **16 МБ**.
- Фіксованої схеми немає: два документи в колекції можуть мати різні поля. Але її можна вимагати через **валідацію схеми** (`$jsonSchema`) на колекції.

## Створення

Приклади використовують `mongosh`, оболонку MongoDB; API драйверів (Node.js, Python, C#, Java) виглядають майже так само.

```js
db.products.insertOne({ name: "Chess Set", category: "games", price: 35, tags: ["gift"] })
db.products.insertMany([
  { name: "Puzzle 1000", category: "games", price: 14.5 },
  { name: "Seed Kit", price: 9.99 }                 // без категорії: дозволено
])
```

Колекції та бази створюються під час першої вставки.

## Читання

```js
db.products.find()                                          // усе
db.products.find({ category: "games" })                     // рівність
db.products.find({ price: { $gte: 20, $lt: 100 } })         // діапазон
db.products.find({ category: { $in: ["games", "books"] } }) // IN
db.products.find({ "specs.color": "black" })                // вкладене поле: крапкова нотація
db.products.find({ tags: "bestseller" })                    // масив містить значення
db.products.find({ tags: { $all: ["gift", "bestseller"] } })// масив містить усі значення
db.products.find({ discount: { $exists: true } })           // поле присутнє
db.products.find({ $or: [{ price: { $lt: 15 } }, { tags: "gift" }] })

db.products.find({ category: "games" }, { name: 1, price: 1, _id: 0 })   // проєкція
  .sort({ price: -1 })                                                    // ORDER BY price DESC
  .skip(20).limit(10)                                                     // OFFSET 20 LIMIT 10

db.products.findOne({ _id: ObjectId("66a1f0c2e4b0a1b2c3d4e5f6") })
db.products.countDocuments({ category: "games" })
```

Умови в одному об'єкті поєднуються через AND. Зверніть увагу на дві відмінності від SQL: умова на поле-**масив** спрацьовує, якщо збігається **будь-який елемент**, а відсутнє поле просто не збігається (тризначної логіки немає, але `{ field: null }` знаходить і `null`, і відсутнє поле).

## Оновлення

Оновлення використовують **оператори**:

```js
db.products.updateOne(
  { name: "Chess Set" },
  { $set: { price: 38.5, "specs.material": "wood" }, $inc: { stock: -1 } }
)
db.products.updateMany({ category: "games" }, { $mul: { price: 1.1 } })
db.products.updateOne({ name: "Chess Set" }, { $push: { tags: "classic" } })     // додати в масив
db.products.updateOne({ name: "Chess Set" }, { $addToSet: { tags: "gift" } })    // додати, якщо немає
db.products.updateOne({ name: "Chess Set" }, { $pull: { tags: "classic" } })     // прибрати з масиву
db.products.updateOne({ name: "Chess Set" }, { $unset: { discount: "" } })       // видалити поле

// upsert: оновити або вставити, якщо нічого не знайдено
db.pageViews.updateOne({ page: "/home", day: "2024-09-01" }, { $inc: { views: 1 } }, { upsert: true })

// замінити весь документ (окрім _id)
db.products.replaceOne({ name: "Seed Kit" }, { name: "Seed Kit", price: 8.99, category: "garden" })
```

Кожна операція з **одним документом** атомарна, зокрема зміни кількох полів і вкладених масивів. Тому моделювання в MongoDB намагається тримати дані, що змінюються разом, в одному документі. `findOneAndUpdate` повертає документ до чи після зміни, як `UPDATE … RETURNING`.

## Видалення

```js
db.products.deleteOne({ name: "Seed Kit" })
db.products.deleteMany({ stock: 0 })
db.products.deleteMany({})          // усе, обережно
```

## У коді застосунку

```js
// драйвер Node.js
const products = client.db("shop").collection("products");
const cheap = await products.find({ price: { $lt: 30 } }).sort({ price: 1 }).toArray();
```

ODM на кшталт **Mongoose** додають поверх схеми, валідацію та проміжні обробники, приблизно як ORM для SQL-баз.
