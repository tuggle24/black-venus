import test from "ava";
import { createSpy, isSpy } from "./create-spy.js";

test("createSpy return a spy function", (t) => {
  const spy = createSpy();

  t.notThrows(spy); // should be true
});

test("createSpy tracks if spy has been called", (t) => {
  const spy = createSpy();

  spy();

  t.true(spy.hasBeenCalled); // should be true
});

test("createSpy retrieve set name", (t) => {
  const spy = createSpy();

  t.is(spy.spyName, "");

  spy.setSpyName("black-venus");

  t.is(spy.spyName, "black-venus");

  spy.setSpyName("josephine");

  t.is(spy.spyName, "josephine");
});

test("createSpy fake return value", (t) => {
  const spy = createSpy();
  spy.returnValue(17);

  const sut = spy();

  t.is(sut, 17);
});

test("createSpy record call argument", (t) => {
  const spy = createSpy();

  spy(7, 10, 17, 27);
  spy(34, 49);

  t.deepEqual(spy.calls, [
    [7, 10, 17, 27],
    [34, 49],
  ]);
});

test("createSpy fake function", (t) => {
  const spy = createSpy({ fakeFunction: (i) => i + 10 });

  spy(7);

  t.is(spy.results[0], 17);
});

test("createSpy method chaining", (t) => {
  const spy = createSpy();

  spy.setSpyName("josephine").returnValue(17)();

  t.is(spy.results[0], 17);
  t.is(spy.spyName, "josephine");
});

test("createSpy can capture `this` with bound", (t) => {
  const spy = createSpy();

  const bound = spy.bind({ that: "this" });

  t.notThrows(spy);
  t.notThrows(bound);
  t.deepEqual(spy.calls, [[]]);
  t.deepEqual(bound.calls, [[]]);
  t.deepEqual(spy.instances, [{ that: "this" }]);
});

test("createSpy add properties", (t) => {
  const spy = createSpy();

  spy.PI = 3.14;

  t.is(spy.PI, 3.14);
});

test("createSpy add properties recursively", (t) => {
  const spy = createSpy();

  spy.constants.PI = 3.14;

  t.is(spy.constants.PI, 3.14);
});

test("createSpy recursively define properties lazily", (t) => {
  const spy = createSpy();

  spy.constants.PI;

  t.notThrows(spy);
  t.notThrows(spy.constants);
  t.notThrows(spy.constants.PI);
  t.deepEqual(spy.calls, [[]]);
  t.deepEqual(spy.constants.calls, [[]]);
  t.deepEqual(spy.constants.PI.calls, [[]]);
});

test("createSpy create multiple different spies", (t) => {
  const spy1 = createSpy();
  const spy2 = createSpy();

  spy1();
  spy1();
  spy2();

  t.notDeepEqual(spy1, spy2);
  t.not(spy1.calls.length, spy2.calls.length);
});

test("createSpy can count how many times property being accessed", (t) => {
  const spy = createSpy();

  spy.key;
  spy.key.subKey;
  spy.key.subKey.routine();

  t.is(spy.propertyAccessedCount.key, 3);
  t.is(spy.key.propertyAccessedCount.subKey, 2);
  t.is(spy.key.subKey.propertyAccessedCount.routine, 1);
  t.deepEqual(spy.key.subKey.routine.calls, [[]]);
});

test("createSpy inspect how spy is being used ", (t) => {
  const example = (execa) => {
    execa.sync("unknown", ["command"]);
    const subprocess = execa("node");
    subprocess.killed;
    subprocess.isCanceled;
    subprocess.cancel();
    subprocess.killed;
    subprocess.isCanceled;
  };
  const spy = createSpy();

  example(spy);

  t.deepEqual(spy.sync.calls, [["unknown", ["command"]]]);
  t.deepEqual(spy.calls, [["node"]]);
  t.truthy(spy.results[0].killed);
  t.truthy(spy.results[0].isCanceled);
  t.deepEqual(spy.results[0].cancel.calls, [[]]);
  t.truthy(spy.results[0].isCanceled);
  t.truthy(spy.results[0].isCanceled);
});

test("createSpy create spy with new keyword", (t) => {
  const spy = createSpy();

  new spy();

  t.deepEqual(spy.instances, [{}]);
});

test("createSpy has private isSpy property", (t) => {
  const spy = createSpy();

  const trainedSpy = spy();
  const nestedSpy = spy.nested;

  t.true(Reflect.has(spy, isSpy));
  t.true(Reflect.has(trainedSpy, isSpy));
  t.true(Reflect.has(nestedSpy, isSpy));
});

// test("createSpy fakeFunctionOnce take precedence over fakeReturnValueOnce", (t) => {
//   const spy = createSpy({ fakeReturnValueOnce: 17, fakeFunctionOnce: () => 0 });

//   spy();
//   spy();
//   spy();

//   t.is(spy.results[0], 0);
//   t.is(spy.results[1], 17);
//   t.true(Reflect.has(spy.results[2], isSpy));
// });
