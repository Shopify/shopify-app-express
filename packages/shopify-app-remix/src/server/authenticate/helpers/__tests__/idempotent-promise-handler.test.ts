import {IdempotentPromiseHandler} from '../idempotent-promise-handler';

describe('IdempotentPromiseHandler', () => {
  it('runs the promise function only once for the same identifier', async () => {
    // GIVEN
    const promiseFunction = jest.fn();
    const promiseHandler = new IdempotentPromiseHandler();

    // WHEN
    promiseHandler.handlePromise(promiseFunction, {
      promiseIdentifier: 'first-promise',
    });

    promiseHandler.handlePromise(promiseFunction, {
      promiseIdentifier: 'first-promise',
    });

    // THEN
    expect(promiseFunction).toHaveBeenCalledTimes(1);
  });

  it('runs the promise function once for each identifier', async () => {
    // GIVEN
    const promiseFunction = jest.fn();
    const promiseHandler = new IdempotentPromiseHandler();

    // WHEN
    promiseHandler.handlePromise(promiseFunction, {
      promiseIdentifier: 'first-promise',
    });

    promiseHandler.handlePromise(promiseFunction, {
      promiseIdentifier: 'second-promise',
    });

    // THEN
    expect(promiseFunction).toHaveBeenCalledTimes(2);
  });

  it('runs all promise functions if no identifier is passed', async () => {
    // GIVEN
    const promiseFunction = jest.fn();
    const promiseHandler = new IdempotentPromiseHandler();

    // WHEN
    promiseHandler.handlePromise(promiseFunction);
    promiseHandler.handlePromise(promiseFunction);
    promiseHandler.handlePromise(promiseFunction);

    // THEN
    expect(promiseFunction).toHaveBeenCalledTimes(3);
  });
});
