# Caching Strategy Explanation

## How Caching Works for Users

### Server-Side Caches (Shared by All Users)

1. **Image Validation Cache** (`.image-validation-cache.json`)
   - **Location**: Server filesystem (shared by all users)
   - **TTL**: 7 days
   - **What it does**: Stores which products have valid images
   - **User Impact**: 
     - ✅ **First user after cache expiry**: May experience slower load (validates ~700 products)
     - ✅ **All subsequent users**: Fast load (uses cached validation results)
     - ✅ **Cache persists for 7 days**: Most users never experience validation delay

2. **Next.js Data Cache** (`unstable_cache`)
   - **Location**: Next.js server memory/disk cache
   - **TTL**: 5 minutes (revalidates in background)
   - **What it does**: Caches the entire product fetching and processing pipeline
   - **User Impact**:
     - ✅ **First user after cache expiry**: Triggers background regeneration
     - ✅ **Other users during regeneration**: Get served stale cache instantly (stale-while-revalidate)
     - ✅ **After regeneration**: All users get fresh data instantly

### Result

- **95%+ of users**: Instant page loads (from cache)
- **~5% of users**: May experience slightly slower load (when triggering cache regeneration)
- **The one user who triggers regeneration**: Gets fresh data; others get stale cache during regeneration
- **After 5 minutes**: Cache refreshes in background; no user blocking

### Why This Works

1. **Server-side cache file**: One validation run benefits all users for 7 days
2. **Next.js ISR**: Uses stale-while-revalidate pattern - users rarely wait
3. **Long validation cache TTL**: Image validity rarely changes, so 7-day cache is safe
4. **Background regeneration**: Next.js regenerates in background, doesn't block users

