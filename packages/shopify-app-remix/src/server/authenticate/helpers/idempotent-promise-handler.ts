export class IdempotentPromiseHandler {
  protected identifiers: Set<string>;

  constructor() {
    this.identifiers = new Set<string>();
  }

  async handlePromise(
    promiseFunction: () => Promise<any>,
    options?: {promiseIdentifier?: string},
  ): Promise<any> {
    if (this.isPromiseRunnable(options?.promiseIdentifier)) {
      await promiseFunction();
    }

    return Promise.resolve();
  }

  private isPromiseRunnable(identifier?: string) {
    if (!identifier) return true;

    if (!this.identifiers.has(identifier)) {
      this.identifiers.add(identifier);
      return true;
    }
    return false;
  }
}
