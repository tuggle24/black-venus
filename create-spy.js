import { dequal } from "dequal";

const returnBranch = Symbol("returnBranch");
const returnValue = Symbol("returnValue");
const returnImplementation = Symbol("returnImplementation");
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
        : targetSpy[returnBranch];

    switch (returnCondition) {
      case "returnValue":
        result = targetSpy[returnValue];
        break;
      case "returnImplementation":
        result = targetSpy[returnImplementation](...args);
        break;
      case "spy":
        result = createSpy(configuration);
        break;
      case "oneTime":
        const queuedReturn = targetSpy[oneTime].shift();
        result =
          typeof queuedReturn === "function"
            ? queuedReturn(...args)
            : queuedReturn;
        break;
      case "callIsRehearsed":
        result = rehearsal.returns;
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
    [returnBranch]: {
      value: configuration.hasFakeFunction ? "returnImplementation" : "spy",
      writable: true,
    },
    fakeFunction: {
      value: function (implementation) {
        targetSpy[returnImplementation] = implementation;
        targetSpy[returnBranch] = "returnImplementation";
        return this;
      },
    },
    fakeFunctionOnce: {
      value: function (implementation) {
        targetSpy[oneTime].push(implementation);
        return this;
      },
    },
    [returnImplementation]: {
      value: configuration.hasFakeFunction && configuration.fakeFunction,
      writable: true,
    },
    fakeValue: {
      value: function (value) {
        targetSpy[returnValue] = value;
        targetSpy[returnBranch] = "returnValue";
        return this;
      },
    },
    fakeValueOnce: {
      value: function (value) {
        targetSpy[oneTime].push(value);
        return this;
      },
    },
    [returnValue]: {
      value: undefined,
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
