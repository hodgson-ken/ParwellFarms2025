import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';

// Helper to clean customer data for JSON serialization (remove BigInt values)
function cleanCustomerData(customer: any): any {
  if (!customer) return null;
  
  return {
    id: customer.id,
    givenName: customer.givenName,
    familyName: customer.familyName,
    emailAddress: customer.emailAddress,
    phoneNumber: customer.phoneNumber,
    companyName: customer.companyName,
    nickname: customer.nickname,
    birthday: customer.birthday,
    referenceId: customer.referenceId,
    note: customer.note,
    preferences: customer.preferences,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    // Convert BigInt version to number if it exists
    version: typeof customer.version === 'bigint' 
      ? Number(customer.version) 
      : customer.version,
    // Only include safe, serializable fields
  };
}

// Create or search for customer by phone number (matches original site)
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, givenName, familyName, emailAddress } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const client = getSquareClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Square credentials not configured' },
        { status: 503 }
      );
    }

    // First, try to search for existing customer by phone number
    try {
      const { result } = await client.customersApi.searchCustomers({
        query: {
          filter: {
            phoneNumber: {
              exact: phoneNumber,
            },
          },
        },
      });

      if (result.customers && result.customers.length > 0) {
        // Customer exists, return it (cleaned for serialization)
        return NextResponse.json({
          customer: cleanCustomerData(result.customers[0]),
          isNew: false,
        });
      }
    } catch (searchError) {
      // If search fails, continue to create new customer
      console.log('Customer search failed, creating new customer:', searchError);
    }

    // Customer doesn't exist, create a new one
    const createResponse = await client.customersApi.createCustomer({
      givenName: givenName || '',
      familyName: familyName || '',
      phoneNumber: phoneNumber,
      emailAddress: emailAddress || undefined,
    });

    if (createResponse.result.customer) {
      return NextResponse.json({
        customer: cleanCustomerData(createResponse.result.customer),
        isNew: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Error managing customer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to manage customer' },
      { status: 500 }
    );
  }
}

// Get customer by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const client = getSquareClient();
    if (!client) {
      return NextResponse.json(
        { error: 'Square credentials not configured' },
        { status: 503 }
      );
    }

    const { result } = await client.customersApi.retrieveCustomer(customerId);

    return NextResponse.json({
      customer: cleanCustomerData(result.customer),
    });
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

