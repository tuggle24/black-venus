import { handleOptions } from "./handle-options.js";
import { createSpy } from "./create-spy.js";

export function spy(options) {
  return createSpy(handleOptions(options));
}
