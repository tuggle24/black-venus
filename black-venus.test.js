import test from "ava";
import { createSpy } from "./black-venus.js";

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
  t.deepEqual(spy.calls, [[], []]);
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
