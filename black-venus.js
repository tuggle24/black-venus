export function createSpy({ fakeFunction = () => {}, name = "" } = {}) {
  const results = [];
  const calls = [];
  const instances = [];
  let spyName = "";
  let fakeReturnValue = undefined;

  function targetSpy(...stuff) {
    results.push(fakeReturnValue || fakeFunction(...stuff));
    calls.push(stuff);
    return fakeReturnValue;
  }

  function setSpyName(stuff) {
    spyName = stuff;
    return this;
  }
  setSpyName.bind(targetSpy);

  function returnValue(stuff) {
    fakeReturnValue = stuff;
    return this;
  }
  returnValue.bind(targetSpy);

  const spy = new Proxy(targetSpy, {
    get: (target, property) => {
      if (property === "results") return results;
      if (property === "spyName") return spyName;
      if (property === "hasBeenCalled") return calls.length > 0;
      if (property === "calls") return calls;
      if (property === "instances") return instances;
      if (property === "setSpyName") return setSpyName;
      if (property === "returnValue") return returnValue;
      if (property === "bind") {
        return (stuff) => {
          instances.push(stuff);
          return target.bind(stuff);
        };
      }
      const result = Reflect.get(target, property);
      if (result === undefined) {
        const subSpy = createSpy();
        target[property] = subSpy;
        return subSpy;
      }

      return Reflect.get(target, property);
    },
  });

  return spy;
}
