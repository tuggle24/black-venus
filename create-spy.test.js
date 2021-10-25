import test from "ava";
import { createSpy, isSpy } from "./create-spy.js";
import { handleOptions } from "./handle-options.js";

test("return a spy function", (t) => {
  const spy = createSpy(handleOptions());

  t.notThrows(spy); // should be true
});

test("tracks if spy has been called at least once", (t) => {
  const spy = createSpy(handleOptions());

  spy();

  t.true(spy.hasBeenCalled); // should be true
});

test("can set and get name", (t) => {
  const spy = createSpy(handleOptions());

  t.is(spy.spyName, "");

  spy.setSpyName("black-venus");

  t.is(spy.spyName, "black-venus");

  spy.setSpyName("josephine");

  t.is(spy.spyName, "josephine");
});

test("Use given fake function given via the 'fakeFunction' method", (t) => {
  const spy = createSpy(handleOptions());
  spy.fakeFunction(() => 7000);

  const sut = spy();

  t.is(sut, 7000);
});

test("Return given fake value", (t) => {
  const spy = createSpy(handleOptions());
  spy.fakeValue(17);

  const sut = spy();

  t.is(sut, 17);
});

test("Record call arguments", (t) => {
  const spy = createSpy(handleOptions());

  spy(7, 10, 17, 27);
  spy(34, 49);

  t.deepEqual(spy.calls, [
    [7, 10, 17, 27],
    [34, 49],
  ]);
});

test("Use given name", (t) => {
  const spy = createSpy(
    handleOptions({ fakeFunction: (i) => i + 10, spyName: "josephine" })
  );

  t.is(spy.spyName, "josephine");
});

test("Use given fake function passed as an option", (t) => {
  const spy = createSpy(
    handleOptions({ fakeFunction: (i) => i + 10, name: "" })
  );

  spy(7);

  t.is(spy.results[0], 17);
});

test("Allow method chaining", (t) => {
  const spy = createSpy(handleOptions());

  spy.setSpyName("josephine").fakeValue(17)();

  t.is(spy.results[0], 17);
  t.is(spy.spyName, "josephine");
});

test("capture 'this' value during bind operation", (t) => {
  const spy = createSpy(handleOptions());

  const bound = spy.bind({ that: "this" });

  t.notThrows(spy);
  t.notThrows(bound);
  t.deepEqual(spy.calls, [[]]);
  t.deepEqual(bound.calls, [[]]);
  t.deepEqual(spy.instances, [{ that: "this" }]);
});

test("Add custom properties", (t) => {
  const spy = createSpy(handleOptions());

  spy.constants.PI = 3.14;

  t.notThrows(spy);
  t.true(Reflect.has(spy, isSpy));
  t.notThrows(spy.constants);
  t.true(Reflect.has(spy.constants, isSpy));
  t.is(spy.constants.PI, 3.14);
});

test("createSpy create multiple different spies", (t) => {
  const spy1 = createSpy(handleOptions());
  const spy2 = createSpy(handleOptions());

  spy1();
  spy1();
  spy2();
  spy1.spyName = "Harriet Tubman";
  spy2.spyName = "Josephine";

  t.notDeepEqual(spy1, spy2);
  t.not(spy1.calls.length, spy2.calls.length);
  t.not(spy1.spyName, spy2.spyName);
});

test("Count how many times a property has been accessed", (t) => {
  const spy = createSpy(handleOptions());

  spy.key;
  spy.key.subKey;
  spy.key.subKey.routine();

  t.is(spy.propertyAccessedCount.key, 3);
  t.is(spy.key.propertyAccessedCount.subKey, 2);
  t.is(spy.key.subKey.propertyAccessedCount.routine, 1);
  t.deepEqual(spy.key.subKey.routine.calls, [[]]);
});

test("Create spy with new keyword", (t) => {
  const spy = createSpy(handleOptions());

  new spy();

  t.deepEqual(spy.instances, [{}]);
});

test("Has private isSpy property", (t) => {
  const spy = createSpy(handleOptions());

  t.true(Reflect.has(spy, isSpy));
  t.falsy(Reflect.has(spy, "isSpy"));
});

test("Return spy by default", (t) => {
  const spy = createSpy(handleOptions());

  const trainedSpy = spy();
  const nestedSpy = spy.nested;

  t.true(Reflect.has(nestedSpy, isSpy));
  t.true(Reflect.has(trainedSpy, isSpy));
});

test("Use fakeValueOnce 3 times", (t) => {
  const spy = createSpy(handleOptions());

  spy();
  spy.fakeValueOnce(7).fakeValueOnce(10).fakeValueOnce(17).fakeValue(27);
  spy();
  spy();
  spy();
  spy();

  const results = spy.results.filter((_, index) => index !== 0);

  t.true(Reflect.has(spy.results[0], isSpy));
  t.deepEqual(results, [7, 10, 17, 27]);
});

test("Use fakeFunctionOnce 3 times", (t) => {
  const spy = createSpy(handleOptions());

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

  t.true(Reflect.has(spy.results[0], isSpy));
  t.deepEqual(results, [7, 10, 17, 27]);
});

test("Create rehearsals with given and return methods", (t) => {
  const spy = createSpy(handleOptions());

  spy
    .planRehearsals({ given: [7, 10, 10], returns: 27 })
    .planRehearsals([{ given: [17, 17], returns: 34 }]);

  const result = spy(7, 10, 10);
  spy(17, 17);
  spy();

  t.is(result, 27);
  t.is(spy.results[1], 34);
  t.true(Reflect.has(spy.results[2], isSpy));
});

test("Return a promise value", async (t) => {
  const spy = createSpy(handleOptions());

  spy.fakeAsyncValue(44);

  const result = await spy();

  t.is(result, 44);
});

test("Return a promise function", async (t) => {
  const spy = createSpy(handleOptions());

  spy.fakeFunction(async () => 444);

  const result = await spy();

  t.is(result, 444);
});

test("Return a promise value once", async (t) => {
  const spy = createSpy(handleOptions());

  spy.fakeAsyncValueOnce(4444);

  const result1 = await spy();
  const result2 = await spy();

  t.is(result1, 4444);
  t.true(Reflect.has(result2, isSpy));
});

test("Return a promise function once", async (t) => {
  const spy = createSpy(handleOptions());

  spy.fakeFunctionOnce(async () => 777);

  const result1 = await spy();
  const result2 = await spy();

  t.is(result1, 777);
  t.true(Reflect.has(result2, isSpy));
});
