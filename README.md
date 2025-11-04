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
NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_app_id
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_ENVIRONMENT=sandbox
NEXT_PUBLIC_SQUARE_LOCATION_ID=your_location_id
```

**Important**: Never commit your `.env.local` file to version control!

## Support

For issues or questions, please contact info@parwellfarms.com
