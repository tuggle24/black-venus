export function handleOptions(trainSpy) {
  return function (options) {
    const configuration = {};
    return trainSpy(configuration);
  };
}
