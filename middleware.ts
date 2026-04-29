import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limit storage: IP -> { count, resetAt }
type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanupOldEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }
  
  lastCleanup = now;
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  // Try various headers (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to NextRequest's IP (may not work in all environments)
  return request.ip || 'unknown';
}

// Check if request should be rate limited
function checkRateLimit(
  ip: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // No record or window expired - allow and create new record
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true };
  }

  // Check if limit exceeded
  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Under limit - increment and allow
  record.count++;
  return { allowed: true };
}

// Get rate limit configuration for a path
function getRateLimitConfig(path: string): { limit: number; windowMs: number } {
  // Payment processing - most critical, strictest limit
  if (path.includes('/api/square/process-payment')) {
    return { limit: 5, windowMs: 60000 }; // 5 requests per minute
  }
  
  // Order creation - critical
  if (path.includes('/api/square/create-order')) {
    return { limit: 10, windowMs: 60000 }; // 10 requests per minute
  }
  
  // Customer management - important, users need to login
  if (path.includes('/api/square/customers')) {
    return { limit: 30, windowMs: 60000 }; // 30 requests per minute (users need to login)
  }
  
  // Stock checking - already cached, but still limit
  if (path.includes('/api/square/check-stock')) {
    return { limit: 30, windowMs: 60000 }; // 30 requests per minute
  }
  
  // Order retrieval - users need to access their order history
  if (path.includes('/api/square/orders')) {
    return { limit: 60, windowMs: 60000 }; // 60 requests per minute (more lenient for order history)
  }
  
  // Image serving - mostly cached, less critical
  if (path.includes('/api/square/image')) {
    return { limit: 100, windowMs: 60000 }; // 100 requests per minute
  }
  
  // Default for other API routes
  if (path.startsWith('/api/')) {
    return { limit: 60, windowMs: 60000 }; // 60 requests per minute
  }
  
  // No rate limiting for non-API routes
  return { limit: Infinity, windowMs: 0 };
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only rate limit API routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Clean up old entries periodically
  cleanupOldEntries();

  // Get rate limit configuration
  const { limit, windowMs } = getRateLimitConfig(path);
  
  // If no limit configured, allow request
  if (limit === Infinity) {
    return NextResponse.next();
  }

  // Get client IP
  const ip = getClientIP(request);
  
  // Check rate limit
  const { allowed, retryAfter } = checkRateLimit(ip, limit, windowMs);

  if (!allowed) {
    // Rate limited - return 429 with Retry-After header
    const response = NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter,
      },
      { status: 429 }
    );
    
    // Add Retry-After header (seconds)
    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString());
    }
    
    return response;
  }

  // Request allowed
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


