export function handleOptions(...options) {
  const configuration = {
    fakeFunction: function () {},
    name: "",
  };

  if (options.length === 0) return configuration;

  const argument = options[0];

  if (typeof argument === "function") {
    configuration.fakeFunction = argument;
    return configuration;
  }

  if (typeof argument === "string") {
    configuration.name = argument;
    return configuration;
  }

  if ("fakeFunction" in argument)
    configuration.fakeFunction = argument.fakeFunction;

  if ("name" in argument) configuration.name = argument.name;

  return configuration;
}
