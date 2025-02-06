# @shopify/shopify-app-session-storage-prisma

## 6.0.2

## 6.0.1

## 6.0.0

### Major Changes

- 12c387e: # Update Prisma dependency

  This updates the `prisma` peer dependency to `^6.2.1`.

  Please update your `prisma` and `@prisma/client` dependencies to `^6.2.1` in your project.

## 5.2.3

### Patch Changes

- 39d74d2: Revert upgrade of prisma dependencies

  In version 5.2.2 of this package the `prisma` peer dependency was updated to `^6.0.0`.
  This update reverts that change, to remove the breaking change.
  The prisma dependencies will be updated in the next major version of this package. (6.0.0)

## 5.2.2

## 5.2.1

## 5.2.0

### Minor Changes

- 69b6d14: Adds `isReady` method to `PrismaSessionStorage`. `isReady` will poll based on the configuration or until the table is found to exist. If the table is not found within the timeout, it will return `false`.

  `isReady` will update the internal state of the `PrismaSessionStorage` instance to reflect whether the session table exists and can be used. In case of an unexpected disconnect, use `isReady` to check if the table has recovered.

  Example usage on a Remix app:

  ```ts
  import {sessionStorage} from '../shopify.server';
  // ...
  if (await sessionStorage.isReady()) {
    // ...
  }
  ```

  An equivalent method will soon be available on the `SessionStorage` interface and all other session storage implementations.

## 5.1.5

### Patch Changes

- e7921c0: Log (instead of swallow) errors that may happen during attempts to conenct to DB

## 5.1.4

## 5.1.3

## 5.1.2

## 5.1.1

### Patch Changes

- 760cb0e: Updating prisma dependencies

## 5.1.0

### Minor Changes

- dfcee21: Add option to retry setting up the Prisma DB table at startup

### Patch Changes

- 12a03a4: Updated dependency on Prisma

## 5.0.2

### Patch Changes

- 11dad60: bump @prisma/client from 5.15.0 to 5.15.1
- bc01c34: bump prisma from 5.15.0 to 5.15.1

## 5.0.1

## 5.0.0

### Major Changes

- c2da994:

## Store user information as part of the session

With this change when using online access tokens, the user information is stored as part of the session. Previously only the user ID was stored. This will enable changing of page content or limiting of page visibility by user, as well as unlock logging users actions. This is a breaking change, as the Prisma schema has been updated to include the user information.

For more information review the [migration guide](./MIGRATION_V5.md).

  <details>
  The new session will include the following data:

```ts
 {
    id: 'online_session_id',
    shop: 'online-session-shop',
    state: 'online-session-state',
    isOnline: true,
    scope: 'online-session-scope',
    accessToken: 'online-session-token',
    expires: 2022-01-01T05:00:00.000Z,
    onlineAccessInfo: {
      associated_user: {
        id: 1,
        first_name: 'online-session-first-name'
        last_name: 'online-session-last-name',
        email: 'online-session-email',
        locale: 'online-session-locale',
        email_verified: false,
        account_owner: true,
        collaborator: false,
      },
    }
  }
```

You will be able to access the user information on the Session object:

```ts
const {admin, session} = await authenticate.admin(request);

console.log('user id', session.onlineAccessInfo.associated_user.id);
console.log('user email', session.onlineAccessInfo.associated_user.email);
console.log(
  'account owner',
  session.onlineAccessInfo.associated_user.account_owner,
);
```

  </details>

- 6970109: Drop support for Node 16. This package is compatible with Node version >=18.2.0.

### Minor Changes

- 36e3c62: Add support for Node 22.

### Patch Changes

- edce62f: Updated Prisma dependency to v5.14.0
- Updated dependencies [d9f2601]
- Updated dependencies [92b6772]
- Updated dependencies [b5a4735]
- Updated dependencies [a42efff]
- Updated dependencies [9749f45]
- Updated dependencies [36e3c62]
- Updated dependencies [6970109]
  - @shopify/shopify-api@11.0.0
  - @shopify/shopify-app-session-storage@3.0.0

## 4.0.5

### Patch Changes

- a8d4b3e: Updated @shopify/shopify-api dependency to also allow v10+ since there were no breaking changes affecting this package.

## 4.0.4

### Patch Changes

- b2c0b36: Update dependency on Prisma
- Updated dependencies [16f52ee]
- Updated dependencies [8c97e8a]
  - @shopify/shopify-api@9.7.2
  - @shopify/shopify-app-session-storage@2.1.4

## 4.0.3

### Patch Changes

- 4aa4b59: Bump shopify-api to v9.6.0
- 883fe7b: Bumps @shopify/shopify-api to v9.6.2
- 753d406: Update @shopify/shopify-api to v9.7.1
- Updated dependencies [4aa4b59]
- Updated dependencies [883fe7b]
- Updated dependencies [753d406]
  - @shopify/shopify-app-session-storage@2.1.3

## 4.0.2

### Patch Changes

- 3bc4195: Handle Prisma error P2002 during upsert
- 3938adc: Update shopify-api-js to v9.5
- c6c975f: Update @shopify/shopify-api to 9.5.1
- e192b61: Bumps @prisma/client from 5.9.1 to 5.10.2.
- Updated dependencies [3938adc]
- Updated dependencies [c6c975f]
  - @shopify/shopify-app-session-storage@2.1.2

## 4.0.1

### Patch Changes

- 02a8341: Updated dependency on `@shopify/shopify-api` to 9.3.1
- 321d6a4: Update @shopify/shopify-api to 9.3.2
- 56c2198: Bumps @prisma/client from 5.8.1 to 5.9.1.
- 2d5181b: Add error cause when throwing MissingSessionTableError
- Updated dependencies [02a8341]
- Updated dependencies [321d6a4]
  - @shopify/shopify-app-session-storage@2.1.1

## 4.0.0

### Minor Changes

- 64e0246: Update shopify-api version to 9.2.0

### Patch Changes

- f5742c1: Updated dependency on `@shopify/shopify-api`
- Updated dependencies [f5742c1]
- Updated dependencies [64e0246]
  - @shopify/shopify-app-session-storage@2.1.0

## 3.0.0

### Major Changes

- ea88df2: Updated the dependency on `prisma` to v5+. This package itself has no breaking changes, but you'll need to update your app's dependency on Prisma as well as this package.

### Patch Changes

- b4eeb24: Improved and simplified package.json dependencies
- b998c30: Bump shopify-api version from 9.0.1 to 9.0.2
- Updated dependencies [b4eeb24]
- Updated dependencies [b998c30]
  - @shopify/shopify-app-session-storage@2.0.4

## 2.0.3

### Patch Changes

- d3e4b5e: Updated the dependency on `@shopify/shopify-api`
- Updated dependencies [d3e4b5e]
  - @shopify/shopify-app-session-storage@2.0.3

## 2.0.2

### Patch Changes

- 3685bd4: Bump shopify-api to ^8.1.1
- Updated dependencies [3685bd4]
  - @shopify/shopify-app-session-storage@2.0.2

## 2.0.1

### Patch Changes

- 6d12840: Updating dependencies on @shopify/shopify-api
- Updated dependencies [6d12840]
  - @shopify/shopify-app-session-storage@2.0.1

## 2.0.0

### Major Changes

- f837060: **Removed support for Node 14**

  Node 14 has reached its [EOL](https://endoflife.date/nodejs), and dependencies to this package no longer work on Node 14.
  Because of that, we can no longer support that version.

  If your app is running on Node 14, you'll need to update to a more recent version before upgrading this package.

  This upgrade does not require any code changes.

### Patch Changes

- a69d6fc: Updating dependency on @shopify/shopify-api to v.8.0.1
- Updated dependencies [f837060]
- Updated dependencies [a69d6fc]
  - @shopify/shopify-app-session-storage@2.0.0

## 1.1.1

### Patch Changes

- 616388d: Updating dependency on @shopify/shopify-api to 7.7.0
- Updated dependencies [616388d]
  - @shopify/shopify-app-session-storage@1.1.10

## 1.1.0

### Minor Changes

- 695f829: Allow using custom tables for the Prisma session storage.

### Patch Changes

- 5b862fe: Upgraded shopify-api dependency to 7.6.0
- Updated dependencies [5b862fe]
  - @shopify/shopify-app-session-storage@1.1.9

## 1.0.5

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api
- Updated dependencies [346b623]
  - @shopify/shopify-app-session-storage@1.1.8

## 1.0.4

### Patch Changes

- 13b9048: Updating @shopify/shopify-api dependency to the latest version
- Updated dependencies [13b9048]
  - @shopify/shopify-app-session-storage@1.1.7

## 1.0.3

### Patch Changes

- 90a62de: Throw a specific error when the database doesn't exist to help indicate that a migration might be needed

## 1.0.2

### Patch Changes

- 32296d7: Update @shopify/shopify-api dependency to 7.5.0
- Updated dependencies [32296d7]
  - @shopify/shopify-app-session-storage@1.1.6

## 1.0.1

### Patch Changes

- 93e9126: Updating @shopify/shopify-api dependency
- Updated dependencies [93e9126]
  - @shopify/shopify-app-session-storage@1.1.5

## 1.0.0

### Major Changes

- Initial release of @shopify/shopify-app-session-storage-prisma
