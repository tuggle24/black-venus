import test from "ava";
import { handleOptions } from "./handle-options.js";

test("Accept a single argument of type function which will be default implementation", (t) => {
  const fakeImplementation = () => {};
  const configuration = handleOptions(fakeImplementation);

  t.deepEqual(configuration.fakeFunction, fakeImplementation);
});

test("Accept a single argument of type string for spy name", (t) => {
  const configuration = handleOptions("josephine");

  t.is(configuration.name, "josephine");
});

test("Accept a name", (t) => {
  const configuration = handleOptions({ name: "josephine" });

  t.is(configuration.name, "josephine");
});

test("Accept a fake value in ", (t) => {
  const configuration = handleOptions({ name: "josephine" });

  t.is(configuration.name, "josephine");
});
