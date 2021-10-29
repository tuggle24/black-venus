import { handleOptions } from "./handle-options.js";
import { spyFactory } from "./create-spy.js";

export function createSpy(options) {
  return spyFactory(handleOptions(options));
}
