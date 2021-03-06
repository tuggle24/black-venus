import test from "ava";
import { spyFactory } from "./create-spy.js";
import { handleOptions } from "./handle-options.js";

test("return a spy function", (t) => {
  const spy = spyFactory(handleOptions());

  t.notThrows(spy); // should be true
});

test("tracks if spy has been called at least once", (t) => {
  const spy = spyFactory(handleOptions());

  spy();

  t.true(spy.hasBeenCalled); // should be true
});

test("can set and get name", (t) => {
  const spy = spyFactory(handleOptions());

  t.is(spy.spyName, "");

  spy.setSpyName("black-venus");

  t.is(spy.spyName, "black-venus");

  spy.setSpyName("josephine");

  t.is(spy.spyName, "josephine");
});

test("Use given fake function given via the 'fakeFunction' method", (t) => {
  const spy = spyFactory(handleOptions());
  spy.fakeFunction(() => 7000);

  const sut = spy();

  t.is(sut, 7000);
});

test("Return given fake value", (t) => {
  const spy = spyFactory(handleOptions());
  spy.fakeValue(17);

  const sut = spy();

  t.is(sut, 17);
});

test("Record call arguments", (t) => {
  const spy = spyFactory(handleOptions());

  spy(7, 10, 17, 27);
  spy(34, 49);

  t.deepEqual(spy.calls, [
    [7, 10, 17, 27],
    [34, 49],
  ]);
});

test("Use given name", (t) => {
  const spy = spyFactory(
    handleOptions({ fakeFunction: (i) => i + 10, spyName: "josephine" })
  );

  t.is(spy.spyName, "josephine");
});

test("Use given fake function passed as an option", (t) => {
  const spy = spyFactory(
    handleOptions({ fakeFunction: (i) => i + 10, name: "" })
  );

  spy(7);

  t.is(spy.results[0], 17);
});

test("Allow method chaining", (t) => {
  const spy = spyFactory(handleOptions());

  spy.setSpyName("josephine").fakeValue(17)();

  t.is(spy.results[0], 17);
  t.is(spy.spyName, "josephine");
});

test("capture 'this' value during bind operation", (t) => {
  const spy = spyFactory(handleOptions());

  const bound = spy.bind({ that: "this" });

  t.notThrows(spy);
  t.notThrows(bound);
  t.deepEqual(spy.calls, [[]]);
  t.deepEqual(bound.calls, [[]]);
  t.deepEqual(spy.instances, [{ that: "this" }]);
});

test("Add custom properties", (t) => {
  const spy = spyFactory(handleOptions());

  spy.constants.PI = 3.14;

  t.notThrows(spy);
  t.truthy(spy.fakeFunction);
  t.notThrows(spy.constants);
  t.truthy(spy.constants.fakeFunction);
  t.is(spy.constants.PI, 3.14);
});

test("spyFactory create multiple different spies", (t) => {
  const spy1 = spyFactory(handleOptions());
  const spy2 = spyFactory(handleOptions());

  spy1();
  spy1();
  spy2();
  spy1.setSpyName("Harriet Tubman");
  spy2.setSpyName("Josephine");

  t.notDeepEqual(spy1, spy2);
  t.not(spy1.calls.length, spy2.calls.length);
  t.not(spy1.spyName, spy2.spyName);
});

test("Count how many times a property has been accessed", (t) => {
  const spy = spyFactory(handleOptions());

  spy.key;
  spy.key.subKey;
  spy.key.subKey.routine();

  t.is(spy.getReadCount("key"), 3);
  t.is(spy.key.getReadCount("subKey"), 2);
  t.is(spy.key.subKey.getReadCount("routine"), 1);
});

test("Create spy with new keyword", (t) => {
  const spy = spyFactory(handleOptions());

  const result = new spy();

  t.truthy(result.fakeFunction);
  t.is(result, spy.instances[0]);
});

test("Return spy by default", (t) => {
  const spy = spyFactory(handleOptions());

  const trainedSpy = spy();
  const nestedSpy = spy.nested;

  t.truthy(nestedSpy.fakeFunction);
  t.truthy(trainedSpy.fakeFunction);
});

test("Use fakeValueOnce 3 times", (t) => {
  const spy = spyFactory(handleOptions());

  spy();
  spy.fakeValueOnce(7).fakeValueOnce(10).fakeValueOnce(17).fakeValue(27);
  spy();
  spy();
  spy();
  spy();

  const results = spy.results.filter((_, index) => index !== 0);

  t.truthy(spy.results[0].fakeFunction);

  t.deepEqual(results, [7, 10, 17, 27]);
});

test("Use fakeFunctionOnce 3 times", (t) => {
  const spy = spyFactory(handleOptions());

  spy();
  spy
    .fakeFunctionOnce(() => 7)
    .fakeFunctionOnce(() => 10)
    .fakeFunctionOnce(() => 17)
    .fakeFunction(() => 27);
  spy();
  spy();
  spy();
  spy();

  const results = spy.results.filter((_, index) => index !== 0);
  t.truthy(spy.results[0].fakeFunction);
  t.deepEqual(results, [7, 10, 17, 27]);
});

test("Create rehearsals with given and return methods", (t) => {
  const spy = spyFactory(handleOptions());

  spy
    .planRehearsals({ given: [7, 10, 10], returns: 27 })
    .planRehearsals([{ given: [17, 17], returns: 34 }]);

  const result = spy(7, 10, 10);
  spy(17, 17);
  spy();

  t.is(result, 27);
  t.is(spy.results[1], 34);
  t.truthy(spy.results[2].fakeFunction);
});

test("Create rehearsals with returns being a function", (t) => {
  const spy = spyFactory(handleOptions());

  spy.planRehearsals({ given: [30, 30], returns: (i, j) => i + j });

  const result = spy(30, 30);

  t.is(result, 60);
});

test("Create rehearsals with given and resolves methods", async (t) => {
  const spy = spyFactory(handleOptions());

  spy
    .planRehearsals({ given: [7, 10, 10], resolves: 27 })
    .planRehearsals([{ given: [17, 17], resolves: 34 }]);

  const result1 = await spy(7, 10, 10);
  const reuslt2 = await spy(17, 17);
  spy();

  t.is(result1, 27);
  t.is(reuslt2, 34);
  t.truthy(spy.results[2].fakeFunction);
});

test("Create rehearsals with resolves as functions", async (t) => {
  const spy = spyFactory(handleOptions());

  spy.planRehearsals({ given: [50, 5], resolves: async (i, j) => i + j });

  const result1 = await spy(50, 5);

  t.is(result1, 55);
});

test("Resolve a promise value", async (t) => {
  const spy = spyFactory(handleOptions());

  spy.fakeResolvedValue(44);

  const result = await spy();

  t.is(result, 44);
});

test("Return a promise function", async (t) => {
  const spy = spyFactory(handleOptions());

  spy.fakeFunction(async () => 444);

  const result = await spy();

  t.is(result, 444);
});

test("Resolve a promise value once", async (t) => {
  const spy = spyFactory(handleOptions());

  spy.fakeResolvedValueOnce(4444);

  const result1 = await spy();
  const result2 = await spy();

  t.is(result1, 4444);
  t.truthy(result2.fakeFunction);
});

test("Return a promise function once", async (t) => {
  const spy = spyFactory(handleOptions());

  spy.fakeFunctionOnce(async () => 777);

  const result1 = await spy();
  const result2 = await spy();

  t.is(result1, 777);
  t.truthy(result2.fakeFunction);
});

test("Reject a value", async (t) => {
  const spy = spyFactory(handleOptions());

  spy.fakeRejectedValue(new Error("Espionage failed"));

  const result1 = await t.throwsAsync(spy);

  t.is(result1.message, "Espionage failed");
});

test("Reject a value once", async (t) => {
  const spy = spyFactory(handleOptions());

  spy.fakeRejectedValueOnce(new Error("Espionage failed"));

  const result1 = await t.throwsAsync(spy);

  t.is(result1.message, "Espionage failed");
});

test("Throws an error", async (t) => {
  const spy = spyFactory(handleOptions());

  spy.throws(new TypeError("Espionage failed"));

  t.throws(spy, { instanceOf: TypeError });
});

test("Throws an error with specified message", async (t) => {
  const spy = spyFactory(handleOptions());

  spy.throws("Espionage failed");

  t.throws(spy, { message: "Espionage failed" });
});

// test("record created keys in a map", async (t) => {
//   const spy = spyFactory(handleOptions());

//   spy.setSpyName("josephine");

//   spy.key1;
//   spy.key2;
//   spy.key3;
//   spy.key3.key4;
//   spy.key3.key5;
//   spy.key3.key4.key6;
//   spy.key3.key4.key7;

//   t.deepEqual(spy.fakeKeyMap, {
//     key1: [],
//     key2: [],
//     key3: [],
//     key4: ["key3"],
//     key5: ["key3"],
//     key6: ["key3", "key4"],
//     key7: ["key3", "key4"],
//   });
// });

// test("record created keys in a list", async (t) => {
//   const spy = spyFactory(handleOptions());

//   spy.key1;
//   spy.key2;
//   spy.key3;
//   spy.key3.key4;
//   spy.key3.key5;
//   spy.key3.key4.key6;
//   spy.key3.key4.key7;

//   t.deepEqual(spy.fakeKeys, [
//     "key1",
//     "key2",
//     "key3",
//     "key4",
//     "key5",
//     "key6",
//     "key7",
//   ]);
// });

// test("fakeKeyMap and fakeKeys do not interact between spies", async (t) => {
//   const spy1 = spyFactory(handleOptions());
//   const spy2 = spyFactory(handleOptions());

//   spy1.prop1;
//   spy1.prop2;
//   spy2.prop1;
//   spy2.prop2;

//   t.not(spy1.fakeKeyMap, spy2.fakeKeyMap);
//   t.not(spy1.fakeKeys, spy2.fakeKeys);
// });
