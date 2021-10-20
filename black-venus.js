export function createSpy({ fakeFunction = () => {}, name = "" } = {}) {
  function targetSpy(...stuff) {
    targetSpy.results.push(targetSpy.fakeReturnValue || fakeFunction(...stuff));
    targetSpy.calls.push(stuff);
    return targetSpy.fakeReturnValue;
  }
  Object.defineProperties(targetSpy, {
    hasBeenCalled: {
      get() {
        return this.calls.length > 0;
      },
    },
    results: {
      value: [],
    },
    calls: {
      value: [],
    },
    instances: {
      value: [],
    },
    spyName: {
      value: "",
      writable: true,
    },
    fakeReturnValue: {
      value: undefined,
      writable: true,
    },
    setSpyName: {
      value: function (stuff) {
        targetSpy.spyName = stuff;
        return this;
      },
    },
    returnValue: {
      value: function (stuff) {
        targetSpy.fakeReturnValue = stuff;
        return this;
      },
    },
  });

  const spy = new Proxy(targetSpy, {
    get: (target, property) => {
      if (property === "bind") {
        return (stuff) => {
          targetSpy.instances.push(stuff);
          return target.bind(stuff);
        };
      }

      if (Reflect.get(target, property) === undefined) {
        const subSpy = createSpy();
        target[property] = subSpy;
        return subSpy;
      }

      return Reflect.get(target, property);
    },
  });

  return spy;
}
