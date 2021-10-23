import test from "ava";
import { handleOptions } from "./handle-options.js";

test("Accept a single argument of type function which will be default implementation", (t) => {
  const fakeImplementation = () => {};
  const configuration = handleOptions(fakeImplementation);

  t.deepEqual(configuration.fakeFunction, fakeImplementation);
});

test("Accept a single argument of type string for spy name", (t) => {
  const configuration = handleOptions("josephine");

  t.is(configuration.spyName, "josephine");
});

test("Accept options object with name and function", (t) => {
  const fakeImplementation = () => {};
  const configuration = handleOptions({
    spyName: "josephine",
    fakeFunction: fakeImplementation,
  });

  t.is(configuration.spyName, "josephine");
  t.deepEqual(configuration.fakeFunction, fakeImplementation);
});
