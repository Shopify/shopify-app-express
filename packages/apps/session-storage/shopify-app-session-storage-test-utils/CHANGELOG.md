# @shopify/shopify-app-session-storage-test-utils

## 3.0.13

## 3.0.12

## 3.0.11

## 3.0.10

## 3.0.9

## 3.0.8

## 3.0.7

## 3.0.6

## 3.0.5

## 3.0.4

## 3.0.3

## 3.0.2

## 3.0.1

## 3.0.0

### Major Changes

- 6970109: Drop support for Node 16. This package is compatible with Node version >=18.2.0.

### Minor Changes

- 36e3c62: Add support for Node 22.

### Patch Changes

- c2da994: ## Store user information as part of the session

  With this change when using online access tokens, the user information is stored as part of the session. Previously only the user ID was stored. This will enable changing of page content or limiting of page visibility by user, as well as unlock logging users actions. This is a breaking change, as the Prisma schema has been updated to include the user information.

  For more information review the [migration guide](../shopify-app-session-storage-prisma/MIGRATION_V5.md).

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

- Updated dependencies [d9f2601]
- Updated dependencies [92b6772]
- Updated dependencies [b5a4735]
- Updated dependencies [a42efff]
- Updated dependencies [9749f45]
- Updated dependencies [36e3c62]
- Updated dependencies [6970109]
  - @shopify/shopify-api@11.0.0
  - @shopify/shopify-app-session-storage@3.0.0

## 2.0.5

### Patch Changes

- a8d4b3e: Updated @shopify/shopify-api dependency to also allow v10+ since there were no breaking changes affecting this package.

## 2.0.4

### Patch Changes

- Updated dependencies [16f52ee]
- Updated dependencies [8c97e8a]
  - @shopify/shopify-api@9.7.2
  - @shopify/shopify-app-session-storage@2.1.4

## 2.0.3

### Patch Changes

- 4aa4b59: Bump shopify-api to v9.6.0
- 883fe7b: Bumps @shopify/shopify-api to v9.6.2
- 753d406: Update @shopify/shopify-api to v9.7.1
- Updated dependencies [4aa4b59]
- Updated dependencies [883fe7b]
- Updated dependencies [753d406]
  - @shopify/shopify-app-session-storage@2.1.3

## 2.0.2

### Patch Changes

- 3938adc: Update shopify-api-js to v9.5
- c6c975f: Update @shopify/shopify-api to 9.5.1
- Updated dependencies [3938adc]
- Updated dependencies [c6c975f]
  - @shopify/shopify-app-session-storage@2.1.2

## 2.0.1

### Patch Changes

- 02a8341: Updated dependency on `@shopify/shopify-api` to 9.3.1
- 321d6a4: Update @shopify/shopify-api to 9.3.2
- Updated dependencies [02a8341]
- Updated dependencies [321d6a4]
  - @shopify/shopify-app-session-storage@2.1.1

## 2.0.0

### Minor Changes

- 64e0246: Update shopify-api version to 9.2.0

### Patch Changes

- f5742c1: Updated dependency on `@shopify/shopify-api`
- Updated dependencies [f5742c1]
- Updated dependencies [64e0246]
  - @shopify/shopify-app-session-storage@2.1.0

## 1.0.4

### Patch Changes

- b4eeb24: Improved and simplified package.json dependencies
- b998c30: Bump shopify-api version from 9.0.1 to 9.0.2
- Updated dependencies [b4eeb24]
- Updated dependencies [b998c30]
  - @shopify/shopify-app-session-storage@2.0.4

## 1.0.3

### Patch Changes

- Updated dependencies [d3e4b5e]
  - @shopify/shopify-app-session-storage@2.0.3

## 1.0.2

### Patch Changes

- 3685bd4: Bump shopify-api to ^8.1.1
- Updated dependencies [3685bd4]
  - @shopify/shopify-app-session-storage@2.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [6d12840]
  - @shopify/shopify-app-session-storage@2.0.1

## 1.0.0

### Patch Changes

- f50a78f: Dropping node 14 support
- a69d6fc: Updating dependency on @shopify/shopify-api to v.8.0.1
- Updated dependencies [f837060]
- Updated dependencies [a69d6fc]
  - @shopify/shopify-app-session-storage@2.0.0

## 0.1.10

### Patch Changes

- 616388d: Updating dependency on @shopify/shopify-api to 7.7.0
- Updated dependencies [616388d]
  - @shopify/shopify-app-session-storage@1.1.10

## 0.1.9

### Patch Changes

- 5b862fe: Upgraded shopify-api dependency to 7.6.0
- Updated dependencies [5b862fe]
  - @shopify/shopify-app-session-storage@1.1.9

## 0.1.8

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api
- Updated dependencies [346b623]
  - @shopify/shopify-app-session-storage@1.1.8

## 0.1.7

### Patch Changes

- 13b9048: Updating @shopify/shopify-api dependency to the latest version
- Updated dependencies [13b9048]
  - @shopify/shopify-app-session-storage@1.1.7

## 0.1.6

### Patch Changes

- 32296d7: Update @shopify/shopify-api dependency to 7.5.0
- Updated dependencies [32296d7]
  - @shopify/shopify-app-session-storage@1.1.6

## 0.1.5

### Patch Changes

- 93e9126: Updating @shopify/shopify-api dependency
- Updated dependencies [93e9126]
  - @shopify/shopify-app-session-storage@1.1.5

## 0.1.4

### Patch Changes

- b3453ff: Bumping @shopify/shopify-api dependency to latest version
- Updated dependencies [b3453ff]
  - @shopify/shopify-app-session-storage@1.1.4

## 0.1.3

### Patch Changes

- e1d4f4f: Add @shopify/shopify-api as a peerDependencies entry for each session-storage package, to avoid API library conflicts (e.g., scopesArray.map error). Should help avoid issues like #93
- 1d007e8: Bumps [@shopify/shopify-api](../../shopify-api) from 7.0.0 to 7.1.0. See `@shopify/shopify-api`'s [changelog](../../shopify-api/CHANGELOG.md) for more details.
- Updated dependencies [e1d4f4f]
- Updated dependencies [1d007e8]
  - @shopify/shopify-app-session-storage@1.1.3

## 0.1.2

### Patch Changes

- e4f3415: Bump @shopify/shopify-api from 6.2.0 to 7.0.0. See [changelog](../../shopify-api/CHANGELOG.md) for details.
- Updated dependencies [e4f3415]
  - @shopify/shopify-app-session-storage@1.1.2

## 0.1.1

### Patch Changes

- 97346b3: Fix #132: mysql migrator was unable to detect already applied migrations
- Updated dependencies [97346b3]
  - @shopify/shopify-app-session-storage@1.1.1

## 0.1.0

### Minor Changes

- becc305: Migrations capabilities that can handle persistence changes for all session storage implementations

### Patch Changes

- 8f5749f: Increase size of 'scope' column to 1024 for session storage implementation for RDBMS
- b6501b0: Bump typescript to 4.9.5
- Updated dependencies [b6501b0]
- Updated dependencies [becc305]
  - @shopify/shopify-app-session-storage@1.1.0

## 0.0.3

### Patch Changes

- 222b755: Updating @shopify/shopify-api to v6.1.0
- Updated dependencies [222b755]
  - @shopify/shopify-app-session-storage@1.0.2

## 0.0.2

### Patch Changes

- 866b50c: Update dependencies on shopify-api v6.0.2
- Updated dependencies [866b50c]
  - @shopify/shopify-app-session-storage@1.0.1

## 0.0.1

### Patch Changes

- Updated dependencies [62c2c31]
  - @shopify/shopify-app-session-storage@1.0.0
