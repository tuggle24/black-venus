export const isSpy = Symbol("spy");

export function createSpy({
  fakeFunction,
  name = "",
  context,
  fakeReturnValue,
  fakeReturnValueOnce,
  fakeFunctionOnce,
} = {}) {
  const isFunctionGiven = typeof fakeFunction === "function";

  function baseSpy(...argumentsList) {
    targetSpy.calls.push(argumentsList);
    const isReturnValueGiven = targetSpy.fakeReturnValue !== undefined;

    const result = isFunctionGiven
      ? fakeFunction(...argumentsList)
      : isReturnValueGiven
      ? targetSpy.fakeReturnValue
      : createSpy();

    targetSpy.results.push(result);
    return result;
  }
  const targetSpy = baseSpy.bind(context);
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
    propertyAccessedCount: {
      value: {},
    },
    [isSpy]: {
      value: isSpy,
    },
  });

  const increaseCount = (property) => {
    targetSpy.propertyAccessedCount[property] = Reflect.get(
      targetSpy.propertyAccessedCount,
      property
    )
      ? Reflect.get(targetSpy.propertyAccessedCount, property) + 1
      : 1;
  };

  const spy = new Proxy(targetSpy, {
    get: (target, property) => {
      if (property === "bind") {
        return (context) => {
          target.instances.push(context);
          return createSpy({ context });
        };
      }

      const hasKey = Reflect.has(target, property);

      const value = hasKey ? Reflect.get(target, property) : createSpy();

      if (!hasKey) target[property] = value;

      increaseCount(property);

      return value;
    },
    construct(target, argumentsList) {
      target.instances.push({});
      target.calls.push(argumentsList);
      return createSpy();
    },
  });
  return spy;
}
