## Task

Question 160: "What is a circuit breaker?" Implement its state machine. The clock is fake so the test can move time.

Complete `CircuitBreaker` (you may add fields):

- **Closed**: call the action. A success resets the count of consecutive failures. When the failures reach `failureThreshold`, switch to **Open** and remember the time.
- **Open**: while less than `breakDuration` has passed since opening, throw `CircuitOpenException` **without calling the action** (fail fast). Once the break is over, switch to **HalfOpen** and let this call through as a trial.
- **HalfOpen**: if the trial succeeds, close the circuit (failures = 0); if it fails, open it again and restart the break.
- The action's own exception is always rethrown to the caller (`throw;`).

Follow the timeline (threshold 2, break 10 s): two failures open the circuit; calls at 0 s and 5 s are rejected without touching the service; at 11 s the trial fails and the circuit opens again; at 21 s the trial succeeds. The service is called only 6 times out of 9 attempts — that's the protection the pattern gives to a struggling dependency.

Expected output:

```
ok (Closed)
error (Closed)
error (Open)
rejected (Open)
rejected (Open)
error (Open)
rejected (Open)
ok (Closed)
ok (Closed)
service calls: 6
```
