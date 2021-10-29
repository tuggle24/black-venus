# Black Venus

> Simple yet powerful mocking library

## Install

```
npm install black-venus
```

## Usage

More examples of usage can be found in `create-spy.test.js`

```javascript
import { createSpy } from "black-venus"; // const { createSpy } = require('black-venus')

function student(calculator) {
  calculator(100, 100);
  calculator(10, 10, 7);
  calculator.substract(500, 100);
}

const spy = createSpy({ fakeFunction: () => 55 });
spy.planRehearsals({ given: [10, 10, 7], returns: 49 });
spy.substract.fakeValueOnce(27);

const result = student(spy);

console.log(spy.results[0] === 55);
console.log(spy.results[1] === 49);
console.log(spy.substract.calls[0][0] === 500);
console.log(spy.substract.results[0] === 27);
```

## API

### spy = createSpy(options?)

#### options?

Type: `object | function | string`
Default: `{ fakeFunction: () => createSpy, name: '' }`

`fakeFunction` will be used to return a value once the spy has been called.
`name` will be used as the name of the spy.

If given a `string`, then that string will be used as the value for the `name`.
If given a `function`, then that function will be used as the for `fakeFunction`.
You can also pass an `object` with both or either keys set.

# TODO

- callOrder
- keyList
- renameKey
- lockKey

#### spy.fakeValue()

#### spy.fakeValueOnce()

#### spy.throws()

#### spy.setSpyName()

#### spy.bind()

#### spy.getReadCount()

#### spy.spyName

#### spy.calls

#### spy.results

#### spy.instances

#### spy.hasBeenCalled

#### spy.fakeFunction()

#### spy.fakeFunctionOnce()

#### spy.fakeResolvedValue()

#### spy.fakeResolvedValueOnce()

#### spy.fakeRejectedValue()

#### spy.fakeRejectedValueOnce()

#### spy.planRehearsals({ given: `Array`, returns: `Function | any` })

#### spy.planRehearsals({ given: `Array`, resolves: `Function | any` })
