import { createSpy } from "./index.js";
import test from "ava";

function student(calculator) {
  calculator(100, 100);
  calculator(10, 10, 7);
  calculator.substract(500, 100);
}

test("smoke test for black-venus being used as execa", async (t) => {
  const spy = createSpy({ fakeFunction: () => 55 });
  spy.planRehearsals({ given: [10, 10, 7], returns: 49 });
  spy.substract.fakeValueOnce(27);

  const result = student(spy);

  t.deepEqual(spy.results, [55, 49]);
  t.deepEqual(spy.substract.calls, [[500, 100]]);
  t.is(spy.substract.results[0], 27);
});
