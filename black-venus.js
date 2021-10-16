export function createSpy() {
  let spyName = "";
  let fakeReturnValue = undefined;
  let fakeFunction = () => {};
  const calls = [];
  const results = [];
  const esp628 = (...args) => {
    calls.push(args);
    results.push(fakeFunction(...args) || fakeReturnValue);
    return results[results.length - 1];
  };

  return {
    esp628,
    get hasBeenCalled() {
      return calls.length > 0;
    },
    set spyName(codeName) {
      spyName = codeName;
    },
    set fakeReturnValue(givenValue) {
      fakeReturnValue = givenValue;
    },
    get spyName() {
      return spyName;
    },
    get calls() {
      return calls;
    },
    get results() {
      return results;
    },
    fakeFunction: (givenImplementation) => {
      fakeFunction = givenImplementation;
    },
  };
}
