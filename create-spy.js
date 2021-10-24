import { dequal } from "dequal";

const returnValue = Symbol("returnValue");
const returnSpy = Symbol("returnSpy");
const oneTime = Symbol("oneTime");
const rehearsals = Symbol("rehearsals");

export const isSpy = Symbol("spy");

export function createSpy(configuration) {
  function targetSpy(...args) {
    targetSpy.calls.push(args);

    let result;
    const hasQueuedReturns = targetSpy[oneTime].length !== 0;
    const rehearsal = targetSpy[rehearsals].find(({ given }) =>
      dequal(given, args)
    );
    const returnCondition =
      rehearsal !== undefined
        ? "callIsRehearsed"
        : hasQueuedReturns
        ? "oneTime"
        : targetSpy[returnSpy]
        ? "spy"
        : "returnValue";

    switch (returnCondition) {
      case "callIsRehearsed":
        result = rehearsal.returns;
        break;
      case "oneTime":
        const queuedReturn = targetSpy[oneTime].shift();
        result = queuedReturn(...args);
        break;
      case "spy":
        result = createSpy(configuration);
        break;
      case "returnValue":
        result = targetSpy[returnValue](...args);
        break;
      default:
        result = createSpy(configuration);
    }

    targetSpy.results.push(result);
    return result;
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
      value: configuration.spyName,
      writable: true,
    },
    [oneTime]: {
      value: [],
    },
    [returnSpy]: {
      value: !configuration.hasFakeFunction,
      writable: true,
    },
    fakeFunction: {
      value: function (implementation) {
        targetSpy[returnValue] = implementation;
        targetSpy[returnSpy] = false;
        return this;
      },
    },
    fakeFunctionOnce: {
      value: function (implementation) {
        targetSpy[oneTime].push(implementation);
        return this;
      },
    },
    fakeValue: {
      value: function (value) {
        targetSpy[returnValue] = () => value;
        targetSpy[returnSpy] = false;
        return this;
      },
    },
    fakeValueOnce: {
      value: function (value) {
        targetSpy[oneTime].push(() => value);
        return this;
      },
    },
    [returnValue]: {
      value: configuration.hasFakeFunction
        ? configuration.fakeFunction
        : undefined,
      writable: true,
    },
    setSpyName: {
      value: function (stuff) {
        targetSpy.spyName = stuff;
        return this;
      },
    },
    propertyAccessedCount: {
      value: {},
    },
    [isSpy]: {
      value: isSpy,
    },
    [rehearsals]: {
      value: [],
    },
    planRehearsals: {
      value: function (situations) {
        if (!Array.isArray(situations)) situations = [situations];

        targetSpy[rehearsals].push(...situations);
        return this;
      },
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
          return createSpy(configuration);
        };
      }

      const hasKey = Reflect.has(target, property);

      const value = hasKey
        ? Reflect.get(target, property)
        : createSpy(configuration);

      if (!hasKey) target[property] = value;

      increaseCount(property);

      return value;
    },
    construct(target, args) {
      target.instances.push({});
      target.calls.push(args);
      return createSpy(configuration);
    },
  });
  return spy;
}
