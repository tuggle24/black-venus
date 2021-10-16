import test from "ava";
import { createAgent } from "./create-agent.js";

test("createAgent as an object", (t) => {
  const { hasBeenCalled, esp629 } = createAgent();

  esp629();
  const sut = hasBeenCalled();

  t.true(sut); // should be true
});
