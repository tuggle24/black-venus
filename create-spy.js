import { dequal } from "dequal";

const returnValue = Symbol("returnValue");
const returnSpy = Symbol("returnSpy");
const oneTime = Symbol("oneTime");
const rehearsals = Symbol("rehearsals");
const readCount = Symbol("readCount");

export const isSpy = Symbol("spy");

export function spyFactory(configuration) {
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
        result = rehearsal.finalValue(...args);
        break;
      case "oneTime":
        const queuedReturn = targetSpy[oneTime].shift();
        result = queuedReturn(...args);
        break;
      case "spy":
        result = spyFactory(configuration);
        break;
      case "returnValue":
        result = targetSpy[returnValue](...args);
        break;
      default:
        result = spyFactory(configuration);
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
      value: function (givenValue) {
        targetSpy[returnValue] = () => givenValue;
        targetSpy[returnSpy] = false;
        return this;
      },
    },
    fakeValueOnce: {
      value: function (givenValue) {
        targetSpy[oneTime].push(() => givenValue);
        return this;
      },
    },
    fakeResolvedValue: {
      value: function (givenValue) {
        targetSpy[returnValue] = async () => givenValue;
        targetSpy[returnSpy] = false;
        return this;
      },
    },
    fakeRejectedValue: {
      value: function (givenValue) {
        targetSpy[returnValue] = () => Promise.reject(givenValue);
        targetSpy[returnSpy] = false;
        return this;
      },
    },
    fakeRejectedValueOnce: {
      value: function (givenValue) {
        targetSpy[oneTime].push(() => Promise.reject(givenValue));
        return this;
      },
    },
    fakeResolvedValueOnce: {
      value: function (givenValue) {
        targetSpy[oneTime].push(async () => givenValue);
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
    [readCount]: {
      value: {},
    },
    getReadCount: {
      value: function (key) {
        return targetSpy[readCount][key] || 0;
      },
    },
    [isSpy]: {
      value: isSpy,
    },
    [rehearsals]: {
      value: [],
    },
    planRehearsals: {
      value: function (givenRehearsals) {
        if (!Array.isArray(givenRehearsals))
          givenRehearsals = [givenRehearsals];

        const refinedRehearsals = givenRehearsals.map((rehearsal) => {
          let finalValue = rehearsal.returns || rehearsal.resolves;
          const isAFunction = typeof finalValue === "function";

          if (!isAFunction && "resolves" in rehearsal)
            finalValue = Promise.resolve(finalValue);

          return {
            given: rehearsal.given,
            finalValue: isAFunction ? finalValue : () => finalValue,
          };
        });

        targetSpy[rehearsals].push(...refinedRehearsals);

        return this;
      },
    },
    throws: {
      value: function (err) {
        targetSpy[returnValue] = () => {
          if (err instanceof Error) throw err;
          throw new Error(err);
        };
        targetSpy[returnSpy] = false;
        return this;
      },
    },
  });

  const spy = new Proxy(targetSpy, {
    get: (target, property) => {
      if (property === "then") return undefined;

      if (property === "bind") {
        return (context) => {
          target.instances.push(context);
          return spyFactory(configuration);
        };
      }

      const hasKey = Reflect.has(target, property);

      const value = hasKey
        ? Reflect.get(target, property)
        : spyFactory(configuration);

      if (!hasKey) {
        target[property] = value;
        targetSpy[readCount][property] = 0;
      }

      targetSpy[readCount][property] += 1;

      return value;
    },
    construct(target, args) {
      const newSpy = spyFactory(configuration);
      target.instances.push(newSpy);
      target.calls.push(args);
      return newSpy;
    },
  });
  return spy;
}
