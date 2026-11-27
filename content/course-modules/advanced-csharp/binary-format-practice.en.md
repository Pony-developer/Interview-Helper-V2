## Task

Design a small binary file format for sensor readings with `BinaryWriter`/`BinaryReader`.

**Format**: the 4 ASCII bytes `SNS1` (a magic header), an `int32` record count, then for each reading: `Sensor` as a length-prefixed string (`BinaryWriter.Write(string)`), `Time.Ticks` as `int64`, `Value` as `double`, `Alarm` as `bool`.

1. **`Write(stream, readings)`** writes the format. Create the writer with `leaveOpen: true` (and `Encoding.UTF8`), because the stream belongs to the caller, who wants to read it back afterwards.
2. **`Read(stream)`** reads it back, in exactly the same order and types. If the first 4 bytes aren't `SNS1`, throw `InvalidDataException("Not a sensor file")`. Also use `leaveOpen: true`.

Note how the Cyrillic sensor name survives the round trip: the string's byte length (UTF-8) is what's stored in the prefix, not its character count.

Expected output:

```
bytes: 88, position: 88
temp-1 10:00:00 21.5
temp-2 10:00:05 87.25 ALARM
датчик-3 10:01:00 -4
stream still open: True
Not a sensor file
```
