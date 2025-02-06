import {LATEST_API_VERSION} from '@shopify/shopify-api';
import {MemorySessionStorage} from '@shopify/shopify-app-session-storage-memory';

import type {FutureFlagOptions, FutureFlags} from '../future/flags';
import type {TestOverridesArg} from '../test-helpers/test-config';
import {testConfig as testConfigImport} from '../test-helpers/test-config';

/*
 * This object mandates that all existing future flags be activated for tests. If a new flag is added, this object must
 * be updated to include it, which will also cause all tests to use the new behaviour by default (and likely fail).
 *
 * This way, we'll always ensure our tests are covering all future flags. Please make sure to also have tests for the
 * old behaviour.
 */
const TEST_FUTURE_FLAGS: Required<{[key in keyof FutureFlags]: true}> = {
  unstable_newEmbeddedAuthStrategy: true,
  removeRest: true,
  remixSingleFetch: true,
} as const;

// Override the helper's future flags and logger settings for our purposes
const TEST_CONFIG = {
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  future: TEST_FUTURE_FLAGS,
  logger: {
    log: jest.fn(),
  },
};

// Reset the config object before each test
beforeEach(() => {
  TEST_CONFIG.logger.log.mockReset();
  (TEST_CONFIG as any).sessionStorage = new MemorySessionStorage();
});

export function testConfig<
  Overrides extends TestOverridesArg,
  Future extends FutureFlagOptions,
>(
  {future, ...overrides}: Overrides & {future?: Future} = {} as Overrides & {
    future?: Future;
  },
) {
  return testConfigImport({
    ...TEST_CONFIG,
    ...overrides,
    future: {
      ...TEST_CONFIG.future,
      ...future,
    },
    logger: {
      ...TEST_CONFIG.logger,
      ...(overrides as NonNullable<Overrides>).logger,
    },
  });
}
