import { handleOptions } from "./handle-options.js";
import { createSpy } from "./create-spy.js";

const spy = handleOptions(createSpy);
export { spy };
