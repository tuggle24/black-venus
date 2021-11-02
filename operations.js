export const hasBeenCalled = (espionage) => espionage.report.calls.length > 0;

export const calls = (espionage) => espionage.report.calls;

export const results = (espionage) => espionage.report.results;

export const instances = (espionage) => espionage.report.instances;

export const spyName = (espionage) => espionage.report.spyName;

export const getReadCount = (espionage) => (key) =>
  espionage.report.readCount[key] || 0;

export function setSpyName({ report }, spy) {
  return (givenName) => {
    report.spyName = givenName;
    return spy;
  };
}

export function fakeValue(espionage, spy) {
  return (implementation) => {
    espionage.update((report) => {
      report.returnValue = () => implementation;
    });
    return spy;
  };
}

export function fakeFunction(espionage, spy) {
  return (implementation) => {
    espionage.update((report) => {
      report.returnValue = implementation;
    });
    return spy;
  };
}

export function throws(espionage, spy) {
  return (err) => {
    espionage.update((report) => {
      report.returnValue = () => {
        if (err instanceof Error) throw err;
        throw new Error(err);
      };
    });
    return spy;
  };
}

export function fakeResolvedValue(espionage, spy) {
  return (givenValue) => {
    espionage.update((report) => {
      report.returnValue = async () => givenValue;
    });
    return spy;
  };
}

export function fakeRejectedValue({ update }, spy) {
  return (givenValue) => {
    update((report) => {
      report.returnValue = () => Promise.reject(givenValue);
    });
    return spy;
  };
}

export function fakeFunctionOnce({ update }, spy) {
  return (implementation) => {
    update((report) => report.oneTime.push(implementation));
    return spy;
  };
}

export function fakeValueOnce({ update }, spy) {
  return (givenValue) => {
    update((report) => report.oneTime.push(() => givenValue));
    return spy;
  };
}

export function fakeResolvedValueOnce({ update }, spy) {
  return (givenValue) => {
    update(({ oneTime }) => oneTime.push(() => Promise.resolve(givenValue)));
    return spy;
  };
}

export function fakeRejectedValueOnce({ update }, spy) {
  return (givenValue) => {
    update(({ oneTime }) => oneTime.push(() => Promise.reject(givenValue)));
    return spy;
  };
}

export function planRehearsals({ update }, spy) {
  return (givenRehearsals) => {
    if (!Array.isArray(givenRehearsals)) givenRehearsals = [givenRehearsals];

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

    update(({ rehearsals }) => rehearsals.push(...refinedRehearsals));

    return spy;
  };
}
