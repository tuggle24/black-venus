import { dequal } from "dequal";
import * as operations from "./operations.js";
import { startEspionage } from "./start-espionage.js";

export function spyFactory(configuration) {
  const espionage = startEspionage(configuration);

  const spy = new Proxy(function () {}, {
    get: (target, property) => {
      if (property === "then") return undefined;

      if (typeof property != "symbol" && property in operations)
        return operations[property](espionage, spy);

      if (property === "bind") {
        return (context) => {
          espionage.update(({ instances }) => instances.push(context));
          return spyFactory(configuration);
        };
      }

      const hasKey = Reflect.has(target, property);

      const value = hasKey
        ? Reflect.get(target, property)
        : spyFactory(configuration);

      if (!hasKey) {
        target[property] = value;
        espionage.update(({ readCount }) => (readCount[property] = 0));
      }

      espionage.update(({ readCount }) => readCount[property]++);

      return value;
    },
    construct(target, args) {
      const newSpy = spyFactory(configuration);
      espionage.update(({ instances }) => instances.push(newSpy));
      espionage.update(({ calls }) => calls.push(args));

      return newSpy;
    },
    apply: function (_, __, argumentsList) {
      espionage.update(({ calls }) => calls.push(argumentsList));

      const hasQueuedReturns = espionage.report.oneTime.length !== 0;

      const rehearsal = espionage.report.rehearsals.find(({ given }) =>
        dequal(given, argumentsList)
      );

      const returnCondition =
        rehearsal !== undefined
          ? "callIsRehearsed"
          : hasQueuedReturns
          ? "oneTime"
          : typeof espionage.report.returnValue == "function"
          ? "returnValue"
          : "spy";

      let result;

      switch (returnCondition) {
        case "callIsRehearsed":
          result = rehearsal.finalValue(...argumentsList);
          break;
        case "oneTime":
          const queuedReturn = espionage.report.oneTime.shift();
          result = queuedReturn(...argumentsList);
          break;
        case "spy":
          result = spyFactory(configuration);
          break;
        case "returnValue":
          result = espionage.report.returnValue(...argumentsList);
          break;
        default:
          result = spyFactory(configuration);
      }

      espionage.update(({ results }) => results.push(result));
      return result;
    },
  });

  return spy;
}
