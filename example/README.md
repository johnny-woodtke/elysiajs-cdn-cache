# elysiajs-cdn-cache Example

A comprehensive demonstration of the [`elysiajs-cdn-cache`](https://github.com/johnny-woodtke/elysiajs-cdn-cache) plugin showcasing various cache control patterns and CDN optimization strategies.

## 🌐 Live Demo

**Preview the example live:** [https://elysiajs-cdn-cache.vercel.app/](https://elysiajs-cdn-cache.vercel.app/)

This example demonstrates real-world cache control implementations with different caching strategies for various types of content.

## 📋 What This Example Demonstrates

This project showcases how to implement effective CDN caching strategies using the `elysiajs-cdn-cache` plugin with:

- **Multi-layered caching** - Different cache durations for browsers, CDNs, and Vercel's Edge Network
- **Route-specific caching** - Tailored cache strategies for different API endpoints
- **Next.js integration** - Seamless integration between Elysia API routes and Next.js frontend
- **Real-time cache inspection** - See cache headers in action with live timestamps
- **Production deployment** - Optimized for Vercel Edge Functions

## 🚀 Running Locally

### Prerequisites

- [Bun](https://bun.sh/)
- Git

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/johnny-woodtke/elysiajs-cdn-cache.git
   cd elysiajs-cdn-cache/example
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Start the development servers:**

   **Option A: Run both services (recommended):**

   ```bash
   # Terminal 1 - API Server
   bun run dev:api

   # Terminal 2 - Next.js Frontend
   bun run dev:next
   ```

   **Option B: Individual services:**

   ```bash
   # API server only (port 3000)
   bun run dev:api

   # Next.js frontend only (port 3001)
   bun run dev:next
   ```

4. **Access the application:**
   - **Frontend**: [http://localhost:3001](http://localhost:3001)
   - **API**: [http://localhost:3000/api](http://localhost:3000/api)

## 📱 API Endpoints & Cache Strategies

The example implements different caching patterns across various endpoints:

### `GET /api`

**Strategy**: Public caching with CDN optimization

```typescript
Cache-Control: public, s-maxage=120, max-age=60
```

- **Browser cache**: 60 seconds
- **CDN cache**: 120 seconds
- **Use case**: General API responses that can be publicly cached

### `GET /api/:id`

**Strategy**: Private caching for personalized content

```typescript
Cache-Control: private, max-age=60
```

- **Browser cache**: 60 seconds (private only)
- **CDN cache**: Not cached (private directive)
- **Use case**: User-specific or personalized data

### `GET /api/all`

**Strategy**: Aggressive public caching

```typescript
Cache-Control: public, s-maxage=120, max-age=60
```

- **Browser cache**: 60 seconds
- **CDN cache**: 120 seconds
- **Use case**: Static or rarely changing data

## 🔧 Multi-CDN Configuration

The example demonstrates multi-tier cache control using:

```typescript
app.use(
  cacheControl(
    "Cache-Control", // Browser cache
    "CDN-Cache-Control", // General CDN cache
    "Vercel-CDN-Cache-Control" // Vercel Edge Network
  )
);
```

This enables fine-grained control over caching at different network layers.

## 🧪 Testing Cache Behavior

1. **View cache headers:**

   - Open browser DevTools → Network tab
   - Make requests to different API endpoints
   - Inspect response headers for `Cache-Control` values

2. **Test cache invalidation:**

   - Note timestamps in API responses
   - Refresh page before cache expiry (same timestamp)
   - Wait for cache expiry and refresh (new timestamp)

3. **Inspect Vercel Edge caching:**
   - Look for `x-vercel-cache` header in responses
   - Values: `MISS`, `HIT`, `STALE`

## 🔄 Cache Control Examples in Action

### Example 1: Public API Response

```bash
curl -I https://elysiajs-cdn-cache.vercel.app/api
# Returns: Cache-Control: public, s-maxage=120, max-age=60
```

### Example 2: Private User Data

```bash
curl -I https://elysiajs-cdn-cache.vercel.app/api/user123
# Returns: Cache-Control: private, max-age=60
```

### Example 3: Bulk Data Endpoint

```bash
curl -I https://elysiajs-cdn-cache.vercel.app/api/all
# Returns: Cache-Control: public, s-maxage=120, max-age=60
```

## 🚢 Deployment

This example is configured for seamless deployment on Vercel:

1. **Fork the repository**
2. **Connect to Vercel**
3. **Deploy automatically** - No configuration needed!

The `vercel.json` configuration handles:

- Bun runtime for API functions
- Edge function optimization
- Proper routing setup

## 🔗 Related Resources

- **Main Plugin**: [elysiajs-cdn-cache](https://github.com/johnny-woodtke/elysiajs-cdn-cache)
- **Elysia.js**: [Official Documentation](https://elysiajs.com)
- **Vercel Edge Functions**: [Documentation](https://vercel.com/docs/functions/edge-functions)
- **Cache-Control Headers**: [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

## 💡 Key Takeaways

This example demonstrates:

1. **How to implement different cache strategies** for various content types
2. **Multi-tier caching configuration** for optimal performance
3. **Real-world integration patterns** with modern web frameworks
4. **Production deployment best practices** for CDN optimization
5. **Cache header inspection and debugging** techniques

Explore the code to understand how each caching pattern is implemented and adapt them to your own projects!
