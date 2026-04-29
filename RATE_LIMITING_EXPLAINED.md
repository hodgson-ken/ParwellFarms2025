# Rate Limiting Explained

## What is Rate Limiting?

**Rate limiting** is a security feature that restricts how many requests a user (or IP address) can make to your API endpoints within a certain time period.

Think of it like a speed limit on a highway - it prevents people from going too fast and causing problems.

## Why Your Site Needs It

### Without Rate Limiting:
- **Attackers** could spam your payment endpoint with thousands of requests
- **Bots** could scrape your entire product catalog in seconds
- **Malicious users** could overload your Square API calls, hitting rate limits and costing you money
- **One user** could bring down your site by making too many requests

### With Rate Limiting:
- Each user/IP can only make a reasonable number of requests
- Prevents abuse and protects your Square API quota
- Ensures fair access for all legitimate users
- Protects against Distributed Denial of Service (DDoS) attacks

## Real-World Example

Imagine someone creates a script that:
1. Makes 1000 requests per second to your `/api/square/create-order` endpoint
2. Tries to create fake orders
3. Hits your Square API rate limits (Square may charge you or block you)
4. Makes your site slow or unavailable for real customers

**Rate limiting stops this** by saying: "You've made 10 requests this minute. Please wait before trying again."

## How Rate Limiting Works

### Basic Concept:
```
User makes request → Check: "How many requests has this user made in the last minute?"
  ├─ If < limit (e.g., 10 requests/minute) → Allow request ✅
  └─ If >= limit → Block request ❌ (return 429 Too Many Requests)
```

### Common Limits:
- **Payment endpoints**: 5-10 requests per minute (critical, high security)
- **Product browsing**: 60 requests per minute (less critical, users scroll a lot)
- **Stock checking**: 30 requests per minute (cached, but still needs limits)

## What Gets Rate Limited?

For your site, you should rate limit:

### 🔴 Critical (High Priority):
1. **`/api/square/process-payment`** - Payment processing
   - Limit: **5 requests per minute per IP**
   - Why: Prevents payment fraud, protects Square API quota

2. **`/api/square/create-order`** - Order creation
   - Limit: **10 requests per minute per IP**
   - Why: Prevents order spam, protects Square API

### 🟡 Important (Medium Priority):
3. **`/api/square/customers`** - Customer creation/login
   - Limit: **20 requests per minute per IP**
   - Why: Prevents account enumeration attacks

4. **`/api/square/check-stock`** - Stock checking
   - Limit: **30 requests per minute per IP**
   - Why: Already cached, but still needs limits

### 🟢 Low Priority:
5. **`/api/square/image/[id]`** - Image serving
   - Limit: **100 requests per minute per IP**
   - Why: Mostly cached, less critical

## Implementation Options

### Option 1: Simple In-Memory (Good for single server)
```typescript
// Simple counter stored in memory
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetAt) {
    // First request or window expired
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // Allow
  }
  
  if (record.count >= limit) {
    return false; // Block
  }
  
  record.count++;
  return true; // Allow
}
```

**Pros**: Simple, no dependencies
**Cons**: Only works on single server, resets on server restart

### Option 2: Redis (Good for production, multiple servers)
```typescript
// Uses Redis to store counts across multiple servers
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

async function checkRateLimit(ip: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  
  return count <= limit;
}
```

**Pros**: Works across multiple servers, persistent
**Cons**: Requires Redis setup

### Option 3: Next.js Middleware (Recommended for your site)
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const path = request.nextUrl.pathname;
  
  // Only rate limit API routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Different limits for different endpoints
  let limit = 60; // Default
  let windowMs = 60000; // 1 minute
  
  if (path.includes('/process-payment')) {
    limit = 5;
  } else if (path.includes('/create-order')) {
    limit = 10;
  } else if (path.includes('/customers')) {
    limit = 20;
  } else if (path.includes('/check-stock')) {
    limit = 30;
  }
  
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + windowMs });
    return NextResponse.next();
  }
  
  if (record.count >= limit) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }
  
  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

**Pros**: Built into Next.js, runs before route handlers
**Cons**: Still in-memory (single server)

## HTTP Status Code: 429

When rate limited, your API returns:
- **Status Code**: `429 Too Many Requests`
- **Headers**: 
  - `Retry-After: 60` (seconds until they can try again)
- **Body**: `{ error: "Too many requests. Please try again later." }`

## What Happens to Users?

### Good User Experience:
```javascript
// Client-side handling
try {
  const response = await fetch('/api/square/process-payment', ...);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') || 60;
    alert(`Please wait ${retryAfter} seconds before trying again.`);
    return;
  }
  
  // Normal processing...
} catch (error) {
  // Handle error
}
```

## Square API Rate Limits

**Important**: Square also has rate limits on their API:
- **Payments API**: ~10 requests/second per application
- **Catalog API**: ~10 requests/second per application
- **Orders API**: ~10 requests/second per application

If you hit Square's limits, you'll get a `429` error from Square, which can:
- Cost you money (if you have to retry)
- Make your site unavailable for real customers
- Risk Square suspending your account for abuse

**Your rate limiting protects Square's API** by preventing your site from making too many requests.

## Recommendations for Your Site

### Immediate (Easy):
1. ✅ Add simple in-memory rate limiting to payment endpoints
2. ✅ Return proper 429 status codes
3. ✅ Add client-side handling for rate limit errors

### Future (Production):
1. Consider Redis-based rate limiting if you scale to multiple servers
2. Add rate limiting to all API routes
3. Monitor rate limit hits in your logs

## Cost-Benefit Analysis

### Without Rate Limiting:
- ❌ Risk of Square API abuse
- ❌ Risk of site downtime
- ❌ Potential Square account issues
- ❌ Poor user experience during attacks

### With Rate Limiting:
- ✅ Costs: ~1 hour of development time
- ✅ Benefits: Protection against abuse, better reliability
- ✅ ROI: High (prevents costly incidents)

## Summary

**Rate limiting** is like a bouncer at a club:
- It lets legitimate customers in
- It stops troublemakers from causing problems
- It protects the business (your site and Square API)
- It ensures everyone has a fair experience

For your e-commerce site, rate limiting is **highly recommended** for production, especially on payment endpoints.

