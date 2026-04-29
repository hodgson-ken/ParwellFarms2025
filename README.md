# Parwell Farms Website

A modern, responsive e-commerce website for Parwell Farms with full Square integration for product catalog and payments.

## Features

- **Square Integration**: All products are fetched directly from your Square catalog - no local database needed
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Product Catalog**: Browse products by category (soaps, lotions, lavender, salves, balms, apparel, etc.)
- **Secure Checkout**: Square Payments integration for secure online transactions
- **SEO Optimized**: Built with Next.js 14 for excellent performance and SEO

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Square account with API credentials

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Square credentials:
   - Copy `.env.example` to `.env`
   - Fill in your Square credentials:
     - `NEXT_PUBLIC_SQUARE_APPLICATION_ID`: Your Square Application ID
     - `SQUARE_ACCESS_TOKEN`: Your Square Access Token (server-side only)
     - `SQUARE_ENVIRONMENT`: `sandbox` for testing or `production` for live
     - `NEXT_PUBLIC_SQUARE_LOCATION_ID`: Your Square Location ID

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Square API Setup

1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. Create a new application
3. Get your Application ID and Access Token
4. Enable the following APIs:
   - Catalog API (to fetch products)
   - Payments API (to process payments)
   - Orders API (to create orders)

## Project Structure

```
├── app/
│   ├── api/
│   │   └── square/          # Square API routes
│   ├── products/            # Product pages
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/
│   ├── Navigation.tsx       # Site navigation
│   ├── Footer.tsx           # Site footer
│   ├── ProductCard.tsx      # Product card component
│   └── SquareCheckout.tsx   # Square checkout component
├── lib/
│   └── square.ts           # Square API utilities
└── public/                  # Static assets
```

## Customization

### Colors and Branding

Edit `tailwind.config.js` to customize colors and fonts:
- `lavender`: Lavender color palette
- `farm`: Farm-themed colors (green, cream, brown)

### Content

Update the following files to match your content:
- `app/page.tsx`: Homepage content
- `app/about/page.tsx`: About page content
- `components/Footer.tsx`: Footer information

### Styling

Global styles are in `app/globals.css`. Component-specific styles use Tailwind CSS classes.

## Environment Variables

Create a `.env.local` file with:

```env
# Square API Configuration
NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_app_id
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_ENVIRONMENT=sandbox
NEXT_PUBLIC_SQUARE_LOCATION_ID=your_location_id

# Contact Form Email (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=Parwell Farms Contact <noreply@yourdomain.com>
CONTACT_FORM_EMAIL=life@parwellfarms.com
```

**Important**: Never commit your `.env.local` file to version control!

### Contact Form Setup

The contact form uses [Resend](https://resend.com) to send emails. To set it up:

1. **Sign up for Resend** (free tier: 100 emails/day):
   - Go to https://resend.com
   - Create an account
   - Get your API key from the dashboard

2. **Add to `.env.local`**:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```

3. **Optional - Customize sender email**:
   - Add `RESEND_FROM_EMAIL` with your verified domain email
   - Or use Resend's test domain (`onboarding@resend.dev`) for testing

4. **Optional - Change recipient email**:
   - Add `CONTACT_FORM_EMAIL` to send to a different email address
   - Defaults to `life@parwellfarms.com`

**Note**: Without Resend configured, the form will still work but will only log messages to the console (useful for development).

## Support

For issues or questions, please contact info@parwellfarms.com
