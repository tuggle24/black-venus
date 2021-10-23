export function handleOptions(...options) {
  const configuration = {
    spyName: "",
    hasFakeFunction: false,
  };

  if (options.length === 0) return configuration;

  const argument = options[0];

  if (typeof argument === "function") {
    configuration.fakeFunction = argument;
    configuration.hasFakeFunction = true;
    return configuration;
  }

  if (typeof argument === "string") {
    configuration.spyName = argument;
    return configuration;
  }

  if ("fakeFunction" in argument) {
    configuration.fakeFunction = argument.fakeFunction;
    configuration.hasFakeFunction = true;
  }

  if ("spyName" in argument) configuration.spyName = argument.spyName;

  return configuration;
}
