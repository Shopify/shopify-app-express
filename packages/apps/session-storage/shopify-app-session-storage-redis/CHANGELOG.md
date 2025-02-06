# @shopify/shopify-app-session-storage-redis

## 4.2.6

## 4.2.5

## 4.2.4

## 4.2.3

## 4.2.2

## 4.2.1

## 4.2.0

### Minor Changes

- 9cb261e: Fixed saving/loading online access info and associated user data for redis

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

## 4.1.2

## 4.1.1

## 4.1.0

### Minor Changes

- 25dc094: Added support for passing in a `RedisClient` instance as argument in addition to connection URL.

## 4.0.3

## 4.0.2

## 4.0.1

## 4.0.0

### Major Changes

- 6970109: Drop support for Node 16. This package is compatible with Node version >=18.2.0.

### Minor Changes

- 36e3c62: Add support for Node 22.

### Patch Changes

- 7c74709: Bump redis from 4.6.13 to 4.6.14
- Updated dependencies [d9f2601]
- Updated dependencies [92b6772]
- Updated dependencies [b5a4735]
- Updated dependencies [a42efff]
- Updated dependencies [9749f45]
- Updated dependencies [36e3c62]
- Updated dependencies [6970109]
  - @shopify/shopify-api@11.0.0
  - @shopify/shopify-app-session-storage@3.0.0

## 3.0.5

### Patch Changes

- a8d4b3e: Updated @shopify/shopify-api dependency to also allow v10+ since there were no breaking changes affecting this package.

## 3.0.4

### Patch Changes

- Updated dependencies [16f52ee]
- Updated dependencies [8c97e8a]
  - @shopify/shopify-api@9.7.2
  - @shopify/shopify-app-session-storage@2.1.4

## 3.0.3

### Patch Changes

- 4aa4b59: Bump shopify-api to v9.6.0
- 883fe7b: Bumps @shopify/shopify-api to v9.6.2
- 753d406: Update @shopify/shopify-api to v9.7.1
- Updated dependencies [4aa4b59]
- Updated dependencies [883fe7b]
- Updated dependencies [753d406]
  - @shopify/shopify-app-session-storage@2.1.3

## 3.0.2

### Patch Changes

- 3938adc: Update shopify-api-js to v9.5
- c6c975f: Update @shopify/shopify-api to 9.5.1
- Updated dependencies [3938adc]
- Updated dependencies [c6c975f]
  - @shopify/shopify-app-session-storage@2.1.2

## 3.0.1

### Patch Changes

- 02a8341: Updated dependency on `@shopify/shopify-api` to 9.3.1
- 321d6a4: Update @shopify/shopify-api to 9.3.2
- Updated dependencies [02a8341]
- Updated dependencies [321d6a4]
  - @shopify/shopify-app-session-storage@2.1.1

## 3.0.0

### Minor Changes

- 64e0246: Update shopify-api version to 9.2.0

### Patch Changes

- 106d459: Updates redis from 4.6.11 to 4.6.12.
- f5742c1: Updated dependency on `@shopify/shopify-api`
- Updated dependencies [f5742c1]
- Updated dependencies [64e0246]
  - @shopify/shopify-app-session-storage@2.1.0

## 2.0.4

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

## 1.1.10

### Patch Changes

- 616388d: Updating dependency on @shopify/shopify-api to 7.7.0
- Updated dependencies [616388d]
  - @shopify/shopify-app-session-storage@1.1.10

## 1.1.9

### Patch Changes

- 5b862fe: Upgraded shopify-api dependency to 7.6.0
- Updated dependencies [5b862fe]
  - @shopify/shopify-app-session-storage@1.1.9

## 1.1.8

### Patch Changes

- 346b623: Updating dependency on @shopify/shopify-api
- Updated dependencies [346b623]
  - @shopify/shopify-app-session-storage@1.1.8

## 1.1.7

### Patch Changes

- 13b9048: Updating @shopify/shopify-api dependency to the latest version
- Updated dependencies [13b9048]
  - @shopify/shopify-app-session-storage@1.1.7

## 1.1.6

### Patch Changes

- 32296d7: Update @shopify/shopify-api dependency to 7.5.0
- Updated dependencies [32296d7]
  - @shopify/shopify-app-session-storage@1.1.6

## 1.1.5

### Patch Changes

- 93e9126: Updating @shopify/shopify-api dependency
- Updated dependencies [93e9126]
  - @shopify/shopify-app-session-storage@1.1.5

## 1.1.4

### Patch Changes

- b3453ff: Bumping @shopify/shopify-api dependency to latest version
- Updated dependencies [b3453ff]
  - @shopify/shopify-app-session-storage@1.1.4

## 1.1.3

### Patch Changes

- e1d4f4f: Add @shopify/shopify-api as a peerDependencies entry for each session-storage package, to avoid API library conflicts (e.g., scopesArray.map error). Should help avoid issues like #93
- de5fa79: Bumps [redis](https://github.com/redis/node-redis) from 4.6.5 to 4.6.6. See redis' [release](https://github.com/redis/node-redis/releases/tag/redis@4.6.6) for more details.
- 1d007e8: Bumps [@shopify/shopify-api](../../shopify-api) from 7.0.0 to 7.1.0. See `@shopify/shopify-api`'s [changelog](../../shopify-api/CHANGELOG.md) for more details.
- Updated dependencies [e1d4f4f]
- Updated dependencies [1d007e8]
  - @shopify/shopify-app-session-storage@1.1.3

## 1.1.2

### Patch Changes

- c9804ae: Bump redis from 4.6.4 to 4.6.5. See redis [release note](https://github.com/redis/node-redis/releases/tag/redis@4.6.5) for more details.
- e4f3415: Bump @shopify/shopify-api from 6.2.0 to 7.0.0. See [changelog](../../shopify-api/CHANGELOG.md) for details.
- 27467d8: Add event handlers to redis client to prevent crashing on disconnect event. Fixes #129, #160 (Thanks to @davidhollenbeckx for linking to issue and solution.)
- Updated dependencies [e4f3415]
  - @shopify/shopify-app-session-storage@1.1.2

## 1.1.1

### Patch Changes

- 97346b3: Fix #132: mysql migrator was unable to detect already applied migrations
- Updated dependencies [97346b3]
  - @shopify/shopify-app-session-storage@1.1.1

## 1.1.0

### Minor Changes

- becc305: Migrations capabilities that can handle persistence changes for all session storage implementations

### Patch Changes

- b6501b0: Bump typescript to 4.9.5
- Updated dependencies [b6501b0]
- Updated dependencies [becc305]
  - @shopify/shopify-app-session-storage@1.1.0

## 1.0.2

### Patch Changes

- 222b755: Updating @shopify/shopify-api to v6.1.0
- Updated dependencies [222b755]
  - @shopify/shopify-app-session-storage@1.0.2

## 1.0.1

### Patch Changes

- 1eccbd6: Optimize findSessionsByShop with additional shop-based key, listing array of corresponding session ids
- 866b50c: Update dependencies on shopify-api v6.0.2
- Updated dependencies [866b50c]
  - @shopify/shopify-app-session-storage@1.0.1

## 1.0.0

### Major Changes

- Initial public release of @shopify/shopify-app-session-storage-redis
