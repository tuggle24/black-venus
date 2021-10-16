export function createAgent() {
  let amountOfTimesCalled = 0;
  let hasBeenCalled = false;
  const esp629 = () => {
    amountOfTimesCalled++;
    if (!hasBeenCalled) hasBeenCalled = true;
  };
  return {
    esp629,
    hasBeenCalled: () => hasBeenCalled,
  };
}
