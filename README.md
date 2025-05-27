# elysiajs-cdn-cache

A TypeScript-first CDN caching plugin for [Elysia](https://elysiajs.com) that simplifies cache control header management. No more manually setting cache headers - this plugin provides a clean, type-safe API for managing Cache-Control directives with support for multiple header types.

## ✨ Features

- 🎯 **Type-safe Cache-Control management** - Full TypeScript support for all cache directives
- 🔧 **Fluent API** - Chainable methods for easy cache configuration
- 📝 **Auto-parsing** - Parse existing Cache-Control headers from requests
- 🌐 **Multi-header support** - Support for `Cache-Control`, `CDN-Cache-Control`, and `Vercel-CDN-Cache-Control`
- ⚡ **Zero dependencies** - Lightweight with only Elysia as a peer dependency
- 🛡️ **Production ready** - Supports all standard cache directives

## 📦 Installation

```bash
# Using npm
npm install elysiajs-cdn-cache

# Using bun
bun add elysiajs-cdn-cache

# Using yarn
yarn add elysiajs-cdn-cache

# Using pnpm
pnpm add elysiajs-cdn-cache
```

## 🚀 Quick Start

```typescript
import { Elysia } from "elysia";
import { cacheControl, CacheControl } from "elysiajs-cdn-cache";

const app = new Elysia()
  .use(cacheControl("Cache-Control"))
  .get("/", ({ cacheControl }) => {
    // Set cache headers
    cacheControl.set(
      "Cache-Control",
      new CacheControl()
        .set("public", true)
        .set("max-age", 3600)
        .set("s-maxage", 7200)
    );

    return { message: "Cached response!", timestamp: Date.now() };
  })
  .listen(3000);
```

## 📖 API Reference

### Plugin Setup

```typescript
import { cacheControl } from "elysiajs-cdn-cache";

// Default header (Cache-Control)
app.use(cacheControl());

// Single header
app.use(cacheControl("CDN-Cache-Control"));

// Multiple headers for different CDN layers
app.use(
  cacheControl(
    "Cache-Control", // Browser cache
    "CDN-Cache-Control", // General CDN cache
    "Vercel-CDN-Cache-Control" // Vercel-specific cache
  )
);
```

### CacheControl Class

The `CacheControl` class provides a fluent API for building cache directives:

#### Constructor

```typescript
// Create empty instance
const cache = new CacheControl();

// Parse from existing header string
const cache = new CacheControl("public, max-age=3600, s-maxage=7200");
```

#### Cache Directive Methods

```typescript
const cache = new CacheControl()
  // Time-based directives
  .set("max-age", 3600) // max-age=3600
  .set("s-maxage", 7200) // s-maxage=7200
  .set("stale-while-revalidate", 60) // stale-while-revalidate=60
  .set("stale-if-error", 300) // stale-if-error=300

  // Boolean directives
  .set("public", true) // public
  .set("private", true) // private
  .set("no-cache", true) // no-cache
  .set("no-store", true) // no-store
  .set("must-revalidate", true) // must-revalidate
  .set("proxy-revalidate", true) // proxy-revalidate
  .set("immutable", true) // immutable
  .set("no-transform", true) // no-transform
  .set("must-understand", true); // must-understand
```

#### Serialization

```typescript
const cache = new CacheControl().set("public", true).set("max-age", 3600);

console.log(cache.toString()); // "public, max-age=3600"
```

### Route Handler Usage

```typescript
app.get("/api/data", ({ cacheControl }) => {
  // Read incoming cache headers
  const incomingCache = cacheControl.get("Cache-Control");
  console.log("Incoming cache:", incomingCache.toString());

  // Set response cache headers
  cacheControl.set(
    "Cache-Control",
    new CacheControl().set("public", true).set("max-age", 300) // Browser cache: 5 minutes
  );

  // Set CDN-specific caching
  cacheControl.set(
    "CDN-Cache-Control",
    new CacheControl().set("public", true).set("s-maxage", 3600) // CDN cache: 1 hour
  );

  return { timestamp: Date.now() };
});
```

## 🔧 Common Patterns

### Static Assets

```typescript
app.get("/assets/*", ({ cacheControl }) => {
  cacheControl.set(
    "Cache-Control",
    new CacheControl()
      .set("public", true)
      .set("max-age", 31536000) // 1 year
      .set("immutable", true)
  );

  // Serve static file...
});
```

### API Responses with CDN

```typescript
app.get("/api/posts", ({ cacheControl }) => {
  cacheControl.set(
    "Cache-Control",
    new CacheControl()
      .set("public", true)
      .set("max-age", 60) // Browser: 1 minute
      .set("stale-while-revalidate", 300) // Allow stale for 5 minutes
  );

  cacheControl.set(
    "Vercel-CDN-Cache-Control",
    new CacheControl().set("public", true).set("s-maxage", 3600) // Vercel CDN: 1 hour
  );

  return await getPosts();
});
```

### Private/Authenticated Content

```typescript
app.get("/user/profile", ({ cacheControl }) => {
  cacheControl.set(
    "Cache-Control",
    new CacheControl()
      .set("private", true)
      .set("max-age", 300)
      .set("must-revalidate", true)
  );

  return await getUserProfile();
});
```

### No Caching

```typescript
app.get("/api/realtime", ({ cacheControl }) => {
  cacheControl.set(
    "Cache-Control",
    new CacheControl().set("no-store", true).set("no-cache", true)
  );

  return await getRealtimeData();
});
```

## 🌐 Multi-CDN Support

This plugin supports multiple cache control headers for complex CDN setups:

```typescript
app.use(
  cacheControl(
    "Cache-Control", // Controls browser caching
    "CDN-Cache-Control", // Controls intermediate CDNs
    "Vercel-CDN-Cache-Control" // Controls Vercel's Edge Network
  )
);

app.get("/api/content", ({ cacheControl }) => {
  // Browser cache: 5 minutes
  cacheControl.set(
    "Cache-Control",
    new CacheControl().set("public", true).set("max-age", 300)
  );

  // General CDN: 1 hour
  cacheControl.set(
    "CDN-Cache-Control",
    new CacheControl().set("public", true).set("s-maxage", 3600)
  );

  // Vercel CDN: 24 hours
  cacheControl.set(
    "Vercel-CDN-Cache-Control",
    new CacheControl().set("public", true).set("s-maxage", 86400)
  );
});
```

## 💡 Supported Cache Directives

| Directive                | Type    | Description                                             |
| ------------------------ | ------- | ------------------------------------------------------- |
| `max-age`                | number  | Maximum age in seconds for browser cache                |
| `s-maxage`               | number  | Maximum age in seconds for shared caches (CDNs)         |
| `public`                 | boolean | Response can be cached by any cache                     |
| `private`                | boolean | Response should only be cached by browser               |
| `no-cache`               | boolean | Must revalidate with server before using cached version |
| `no-store`               | boolean | Must not store any part of request/response             |
| `must-revalidate`        | boolean | Must revalidate stale responses with server             |
| `proxy-revalidate`       | boolean | Like must-revalidate but only for shared caches         |
| `immutable`              | boolean | Response will not change during its lifetime            |
| `stale-while-revalidate` | number  | Seconds to serve stale content while revalidating       |
| `stale-if-error`         | number  | Seconds to serve stale content if revalidation fails    |
| `no-transform`           | boolean | Prohibits transformations like compression              |
| `must-understand`        | boolean | Only cache if cache understands requirements            |

## 🔗 Example Project

Check out the [deployed example](https://github.com/johnny-woodtke/elysiajs-cdn-cache/tree/main/example) to see the plugin in action with a Next.js app and Vercel deployment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
