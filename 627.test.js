import test from "ava";
import { createSpy } from "./black-venus.js";

test("createSpy as an object", (t) => {
  const sut = createSpy();

  sut.esp628();

  t.true(sut.hasBeenCalled); // should be true
});

test("createSpy retrieve set name", (t) => {
  const sut = createSpy();

  sut.spyName = "black-venus";

  t.is(sut.spyName, "black-venus");
});

test("createSpy fake return value", (t) => {
  const spy = createSpy();
  spy.fakeReturnValue = 17;

  const sut = spy.esp628();

  t.is(sut, 17);
});

test("createSpy record call argument", (t) => {
  const spy = createSpy();

  spy.esp628(7, 10, 17, 27);
  spy.esp628(34, 49);

  t.deepEqual(spy.calls, [
    [7, 10, 17, 27],
    [34, 49],
  ]);
});

test("createSpy fake function", (t) => {
  const spy = createSpy();
  spy.fakeFunction((i) => i + 10);

  spy.esp628(7);

  t.is(spy.results[0], 17);
});
