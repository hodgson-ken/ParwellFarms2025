# Parwell Farms Website Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Square Credentials**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_square_application_id_here
   SQUARE_ACCESS_TOKEN=your_square_access_token_here
   SQUARE_ENVIRONMENT=sandbox
   NEXT_PUBLIC_SQUARE_LOCATION_ID=your_square_location_id_here
   ```

   **To get your Square credentials:**
   
   a. Go to [Square Developer Dashboard](https://developer.squareup.com/)
   
   b. Create a new application or use an existing one
   
   c. Get your **Application ID** from the application dashboard
   
   d. Generate an **Access Token** (keep this secret - server-side only)
   
   e. Get your **Location ID** from Square Dashboard → Locations
   
   f. Make sure these APIs are enabled:
      - Catalog API
      - Payments API
      - Orders API

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Visit** http://localhost:3000

## Square Setup Details

### Required Square API Permissions

Your Square application needs the following permissions:
- **READ_CATALOG** - To fetch products
- **WRITE_CATALOG** - Optional, if you want to manage products
- **WRITE_ORDERS** - To create orders
- **WRITE_PAYMENTS** - To process payments

### Environment Variables Explained

- **NEXT_PUBLIC_SQUARE_APPLICATION_ID**: Your Square Application ID (public, used in browser)
- **SQUARE_ACCESS_TOKEN**: Your Square Access Token (secret, server-side only)
- **SQUARE_ENVIRONMENT**: Use `sandbox` for testing, `production` for live site
- **NEXT_PUBLIC_SQUARE_LOCATION_ID**: Your Square Location ID (public, used in browser)

### Testing with Square Sandbox

1. Set `SQUARE_ENVIRONMENT=sandbox` in `.env.local`
2. Use Square sandbox test card numbers:
   - Card: `4111111111111111`
   - CVV: `123`
   - Expiry: Any future date
   - ZIP: Any 5-digit code

## Content Customization

### Update Homepage Content

Edit `app/page.tsx` to customize:
- Hero section text
- Featured products display
- About section content

### Update About Page

Edit `app/about/page.tsx` with your farm's story, values, and mission.

### Update Footer

Edit `components/Footer.tsx` to add:
- Your actual contact information
- Social media links
- Additional navigation items

### Brand Colors

Customize colors in `tailwind.config.js`:
- Lavender palette for accent colors
- Farm colors (green, cream, brown) for primary branding

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The site is a standard Next.js application and can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Any Node.js hosting

**Important**: Make sure to set all environment variables in your hosting platform's dashboard.

## Product Management

All products are managed through your Square account:
1. Go to Square Dashboard → Items
2. Add/edit products in Square
3. Products automatically appear on your website
4. No need to update the website when adding products!

## Support

For Square API issues, check:
- [Square Developer Docs](https://developer.squareup.com/docs)
- [Square Support](https://squareup.com/help/us/en)

For website issues, contact your developer.

