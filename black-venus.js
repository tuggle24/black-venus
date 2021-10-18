export function createSpy({ fakeFunction = () => {}, name = "" } = {}) {
  const results = [];
  const calls = [];
  const instances = [];
  let spyName = "";
  let returnValue = undefined;

  function targetSpy(...stuff) {
    results.push(returnValue || fakeFunction(...stuff));
    calls.push(stuff);
    return returnValue;
  }

  targetSpy.setSpyName = function (stuff) {
    spyName = stuff;
    return this;
  };

  targetSpy.returnValue = function (stuff) {
    returnValue = stuff;
    return this;
  };

  const spy = new Proxy(targetSpy, {
    get: (target, property) => {
      if (property === "results") return results;
      if (property === "spyName") return spyName;
      if (property === "hasBeenCalled") return calls.length > 0;
      if (property === "calls") return calls;
      if (property === "instances") return instances;
      if (property === "bind") {
        return (stuff) => {
          instances.push(stuff);
          return target.bind(stuff);
        };
      }
      return Reflect.get(target, property);
    },
  });

  return spy;
}
