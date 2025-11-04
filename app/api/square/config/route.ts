import { NextResponse } from 'next/server';

export async function GET() {
  // Get environment variables based on SQUARE_ENVIRONMENT
  const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox';
  const isProduction = environment === 'production';
  
  // Try production-specific first, then generic, then sandbox-specific
  const appId = isProduction
    ? (process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID_PRODUCTION || process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '')
    : (process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID_SANDBOX || process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '');
    
  const locationId = isProduction
    ? (process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '')
    : (process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '');

  // Debug info (without exposing sensitive data)
  const debug = {
    environment,
    isProduction,
    hasAppIdProd: !!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID_PRODUCTION,
    hasAppIdSandbox: !!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID_SANDBOX,
    hasAppIdGeneric: !!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
    hasLocationIdProd: !!process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION,
    hasLocationIdSandbox: !!process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX,
    hasLocationIdGeneric: !!process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
    selectedAppIdLength: appId.length,
    selectedLocationIdLength: locationId.length,
  };

  // Check if values are still placeholders
  const hasPlaceholder = appId.includes('your_') || locationId.includes('your_') || locationId.includes('placeholder');
  
  return NextResponse.json({
    appId,
    locationId,
    environment,
    hasCredentials: !!(appId && locationId && !hasPlaceholder),
    hasPlaceholder,
    // Show raw values for debugging (these are public env vars anyway)
    rawValues: {
      appIdProd: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID_PRODUCTION || '(not set)',
      appIdSandbox: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID_SANDBOX || '(not set)',
      appIdGeneric: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '(not set)',
      locationIdProd: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_PRODUCTION || '(not set)',
      locationIdSandbox: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID_SANDBOX || '(not set)',
      locationIdGeneric: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '(not set)',
    },
    debug, // Include debug info to help diagnose
  });
}

