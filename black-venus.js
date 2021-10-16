export function createSpy(fakeFunction = () => {}) {
  let spyName = "";
  let fakeReturnValue = undefined;
  const calls = [];
  const results = [];
  function spy(...args) {
    calls.push(args);
    results.push(fakeFunction(...args) || fakeReturnValue);
    return results[results.length - 1];
  }

  const trapper = {
    get: function (target, property, receiver) {
      if (property === "hasBeenCalled") {
        return calls.length > 0;
      }
      if (property === "spyName") {
        return spyName;
      }
      if (property === "calls") {
        return calls;
      }
      if (property === "results") {
        return results;
      }
    },
    set: (target, property, value) => {
      if (property === "spyName") {
        spyName = value;
        return true;
      }
      if (property === "fakeReturnValue") {
        fakeReturnValue = value;
        return true;
      }
    },
  };

  return new Proxy(spy, trapper);
}
