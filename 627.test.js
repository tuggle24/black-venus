import test from "ava";
import { createSpy } from "./black-venus.js";

test("createSpy return a spy function", (t) => {
  const spy = createSpy();

  const sut = spy();

  t.falsy(sut); // should be true
});

test("createSpy tracks if spy has been called", (t) => {
  const spy = createSpy();

  spy();

  t.true(spy.hasBeenCalled); // should be true
});

test("createSpy retrieve set name", (t) => {
  const spy = createSpy();

  spy.spyName = "black-venus";

  t.is(spy.spyName, "black-venus");
});

test("createSpy fake return value", (t) => {
  const spy = createSpy();
  spy.fakeReturnValue = 17;

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
  const spy = createSpy((i) => i + 10);

  spy(7);

  t.is(spy.results[0], 17);
});
