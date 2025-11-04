import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#A0B080] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Footer Logo */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <Image 
                src="/logos/PWF logo_footer.webp" 
                alt="Parwell Farms" 
                width={150}
                height={150}
                className="w-auto h-24 object-contain"
              />
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 text-gray-900">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-800 hover:text-gray-950 transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-800 hover:text-gray-950 transition-colors font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-800 hover:text-gray-950 transition-colors font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 text-gray-900">Contact</h3>
            <div className="text-gray-800 text-sm space-y-2">
              <p className="font-medium">Visit our farm store or shop online</p>
              <p className="mt-4">
                <a 
                  href="mailto:life@parwellfarms.com" 
                  className="text-gray-800 hover:text-gray-950 transition-colors font-medium underline"
                >
                  life@parwellfarms.com
                </a>
              </p>
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 text-gray-900">About</h3>
            <p className="text-gray-800 text-sm font-medium">
              Premium farm products and handcrafted goods made with care and dedication.
            </p>
          </div>
        </div>

        {/* Subfooter with Social Media and Payment Methods */}
        <div className="border-t border-[#8a9b6d] mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-900 text-sm font-medium mr-2">Follow Us:</span>
              <a
                href="https://www.facebook.com/parwellfarms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-gray-700 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/parwellfarms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-gray-700 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="mailto:life@parwellfarms.com"
                className="text-gray-900 hover:text-gray-700 transition-colors"
                aria-label="Email"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2 flex-nowrap justify-center overflow-x-auto">
              <span className="text-gray-900 text-sm font-medium mr-1 whitespace-nowrap">We Accept:</span>
              {/* Visa */}
              <div className="w-10 h-6 bg-white rounded shadow-sm border border-gray-200 flex items-center justify-center px-0.5 flex-shrink-0" title="Visa">
                <span className="text-[8px] font-bold" style={{color: '#1434CB', letterSpacing: '0.3px'}}>VISA</span>
              </div>
              {/* Mastercard */}
              <div className="w-10 h-6 bg-white rounded shadow-sm border border-gray-200 flex items-center justify-center px-0.5 flex-shrink-0" title="Mastercard">
                <div className="flex items-center gap-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 -ml-1.5"></div>
                </div>
              </div>
              {/* American Express */}
              <div className="w-10 h-6 bg-white rounded shadow-sm border border-gray-200 flex items-center justify-center px-0.5 flex-shrink-0" title="American Express">
                <span className="text-[8px] font-bold" style={{color: '#006FCF', letterSpacing: '0.3px'}}>AMEX</span>
              </div>
              {/* Discover */}
              <div className="w-10 h-6 bg-white rounded shadow-sm border border-gray-200 flex items-center justify-center px-0.5 flex-shrink-0" title="Discover">
                <span className="text-[8px] font-bold" style={{color: '#FF6000', letterSpacing: '0.3px'}}>DIS</span>
              </div>
              {/* Apple Pay */}
              <div className="w-10 h-6 bg-black rounded shadow-sm flex items-center justify-center px-1.5 flex-shrink-0" title="Apple Pay">
                <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </div>
              {/* Google Pay */}
              <div className="w-10 h-6 bg-white rounded shadow-sm border border-gray-200 flex items-center justify-center px-0.5 flex-shrink-0" title="Google Pay">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              {/* Cash App */}
              <div className="w-10 h-6 rounded shadow-sm overflow-hidden flex-shrink-0" title="Cash App">
                <Image
                  src="/icons/payment-methods/cashapp.svg"
                  alt="Cash App"
                  width={40}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#8a9b6d] mt-8 pt-8 text-center">
          <p className="text-gray-800 text-sm font-medium">&copy; {currentYear} Parwell Farms. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

