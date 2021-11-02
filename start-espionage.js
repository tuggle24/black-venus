export function startEspionage(configuration) {
  const spyData = {
    calls: [],
    results: [],
    instances: [],
    spyName: configuration.spyName,
    oneTime: [],
    rehearsals: [],
    readCount: {},
    returnValue: configuration.hasFakeFunction
      ? configuration.fakeFunction
      : undefined,
  };

  return {
    update(fn) {
      fn(spyData);
    },
    get report() {
      return spyData;
    },
  };
}
