
<div align = center>

# Shopify App JS

*A mono-repo containing a collection of packages*  
*designed to easily integrate apps with Shopify.*

<br>

```
@shopify/shopify-app-js
```

</div>

<br>
<br>

## Design

This package has been designed to cover specialized use  
cases while building on top of **[@shopify/shopify-api][GitHub API]**

<br>
<br>

## App middleware

<br>

-   ### **[Remix]**

    Middleware for Remix apps that allows apps to communicate  
    with and authenticate requests coming from Shopify.
    
    ```
    @shopify/shopify-app-remix
    ```
    
    [![Badge GitHub]][GitHub Remix]  
    [![Badge NPM Remix]][NPM Remix]

    <br>

-   ### **[Express.js]**

    Middleware for Express apps that allows apps to communicate  
    with and authenticate requests coming from Shopify.

    ```
    @shopify/shopify-app-express
    ```
    
    [![Badge GitHub]][GitHub Express]  
    [![Badge NPM Express]][NPM Express]

<br>
<br>

## Session storage options

*Implementations for different vendors / technologies.*

<br>

-   ### **Memory**

    Simplified memory-based implementation.

    ```
    @shopify/shopify-app-session-storage-memory
    ```
    
    [![Badge GitHub]][GitHub Memory]  
    [![Badge NPM Memory]][NPM Memory]

    <br>
    
-   ### **[Prisma]**

    ```
    @shopify/shopify-app-session-storage-prisma
    ```

    [![Badge GitHub]][GitHub Prisma]  
    [![Badge NPM Prisma]][NPM Prisma]
    
    <br>

-   ### **[SQLite]**

    ```
    @shopify/shopify-app-session-storage-sqlite
    ```
    
    [![Badge GitHub]][GitHub SQLite]  
    [![Badge NPM SQLite]][NPM SQLite]

    <br>

-   ### **[MongoDB]**

    ```
    @shopify/shopify-app-session-storage-mongodb
    ```
    
    [![Badge GitHub]][GitHub MongoDB]  
    [![Badge NPM MongoDB]][NPM MongoDB]

    <br>

-   ### **[MySQL]**

    ```
    @shopify/shopify-app-session-storage-mysql
    ```
    
    [![Badge GitHub]][GitHub MySQL]  
    [![Badge NPM MySQL]][NPM MySQL]

    <br>
    
-   ### **[PostgreSQL]**

    ```
    @shopify/shopify-app-session-storage-postgresql
    ```
    
    [![Badge GitHub]][GitHub PostgreSQL]  
    [![Badge NPM PostgreSQL]][NPM PostgreSQL]

    <br>

-   ### **[Redis]**

    ```
    @shopify/shopify-app-session-storage-redis
    ```
    
    [![Badge GitHub]][GitHub Redis]  
    [![Badge NPM Redis]][NPM Redis]

    <br>

-   ### **[CloudFlare KV Storage]**

    ```
    @shopify/shopify-app-session-storage-kv
    ```
    
    [![Badge GitHub]][GitHub CloudFlare]  
    [![Badge NPM CloudFlare]][NPM CloudFlare]

<br>
<br>

## Session Storage Adaptor

Provides an interface that enables apps to store the sessions  
created during the OAuth process in  `@shopify/shopify-api`

You can assign any implementation of this interface to the  
`@shopify/shopify-app-express`  package, but you can also call  
them directly from your app if you're not building with **[Express.js]**

```
@shopify/shopify-app-session-storage
```

[![Badge GitHub]][GitHub OAuth]  
[![Badge NPM OAuth]][NPM OAuth]

<br>
<br>

## Community Packages

*Contributed `SessionStorage` implementations.*

<br>

-   ### **[AWS DynamoDB]**

    Contributed by **[Chris]** - thank you :clap:

    ```
    @shopify/shopify-app-session-storage-dynamodb
    ```
    
    [![Badge GitHub]][GitHub DynamoDB]  
    [![Badge NPM DynamoDB]][NPM DynamoDB] 

<br>


<!----------------------------------------------------------------------------->

[CloudFlare KV Storage]: https://www.cloudflare.com/products/workers-kv
[AWS DynamoDB]: https://aws.amazon.com/dynamodb/
[PostgreSQL]: https://www.postgresql.org
[Express.js]: https://expressjs.com
[MongoDB]: https://www.mongodb.com/home
[Prisma]: https://www.prisma.io/
[SQLite]: https://www.sqlite.org
[Chris]: https://github.com/zirkelc
[MySQL]: https://www.mysql.com
[Remix]: https://remix.run
[Redis]: https://redis.io


[GitHub CloudFlare]: packages/shopify-app-session-storage-kv
[GitHub PostgreSQL]: packages/shopify-app-session-storage-postgresql
[GitHub DynamoDB]: packages/shopify-app-session-storage-dynamodb
[GitHub MongoDB]: packages/shopify-app-session-storage-mongodb
[GitHub Express]: packages/shopify-app-express
[GitHub SQLite]: packages/shopify-app-session-storage-sqlite
[GitHub Memory]: packages/shopify-app-session-storage-memory
[GitHub Prisma]: packages/shopify-app-session-storage-prisma
[GitHub Redis]: packages/shopify-app-session-storage-redis
[GitHub MySQL]: packages/shopify-app-session-storage-mysql
[GitHub OAuth]: packages/shopify-app-session-storage
[GitHub Remix]: packages/shopify-app-remix
[GitHub API]: https://github.com/Shopify/shopify-api-js


[NPM PostgreSQL]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-postgresql
[NPM CloudFlare]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-kv
[NPM DynamoDB]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-dynamodb
[NPM MongoDB]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mongodb
[NPM Express]: https://www.npmjs.com/package/@shopify/shopify-app-express
[NPM Memory]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-memory
[NPM SQLite]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-sqlite
[NPM Prisma]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-prisma
[NPM Redis]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-redis
[NPM MySQL]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage-mysql
[NPM OAuth]: https://www.npmjs.com/package/@shopify/shopify-app-session-storage
[NPM Remix]: https://www.npmjs.com/package/@shopify/shopify-app-remix


[Badge GitHub]: https://img.shields.io/badge/GitHub-222222?style=for-the-badge&logoColor=white&logo=GitHub


[Badge NPM PostgreSQL]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage-postgresql?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM CloudFlare]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage-kv?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM DynamoDB]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage-dynamodb?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM MongoDB]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage-mongodb?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM Express]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-express?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM Memory]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage-memory?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM SQLite]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage-sqlite?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM Prisma]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage-prisma?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM Redis]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage-redis?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM MySQL]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage-mysql?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM OAuth]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-session-storage?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d
[Badge NPM Remix]: https://img.shields.io/npm/v/%40shopify%2Fshopify-app-remix?style=for-the-badge&logo=NPM&labelColor=CB3837&color=a82d2d

