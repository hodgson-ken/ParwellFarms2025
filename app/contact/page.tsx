'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Thank you! Your message has been sent.',
        });
        // Reset form
        (e.target as HTMLFormElement).reset();
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to send message. Please try again.',
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div 
        className="relative py-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/Lavender2.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">
              Contact Parwell Farms
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Visit our farm store, shop online, or reach out with questions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 bg-farm-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Two Column Layout: Contact Info + Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Left Column: Contact Information */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-farm-green mb-6">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                {/* Physical Address */}
                <div>
                  <h3 className="font-serif font-semibold text-farm-green mb-2 text-lg">Physical Location</h3>
                  <p className="text-gray-700 leading-relaxed">
                    32 Cowlitz Street West<br />
                    Castle Rock, WA 98611
                  </p>
                </div>

                {/* Mailing Address */}
                <div>
                  <h3 className="font-serif font-semibold text-farm-green mb-2 text-lg">Mailing Address</h3>
                  <p className="text-gray-700 leading-relaxed">
                    815 10th St<br />
                    Vader WA 98593
                  </p>
                </div>

                {/* Contact Email */}
                <div>
                  <h3 className="font-serif font-semibold text-farm-green mb-2 text-lg">Email Us</h3>
                  <a 
                    href="mailto:life@parwellfarms.com" 
                    className="text-lavender-600 hover:text-lavender-700 transition-colors font-medium"
                  >
                    life@parwellfarms.com
                  </a>
                </div>

                {/* Store Hours */}
                <div>
                  <h3 className="font-serif font-semibold text-farm-green mb-3 text-lg">Store Hours</h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium">Monday - Tuesday</span>
                      <span className="text-gray-600">Closed</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium">Wednesday - Friday</span>
                      <span className="text-lavender-600 font-semibold">10:00 am - 5:00 pm</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="font-medium">Saturday</span>
                      <span className="text-lavender-600 font-semibold">10:00 am - 3:00 pm</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium italic">Sunday</span>
                      <span className="text-gray-600 italic">Closed for Jesus</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-farm-green mb-4">
                Send us a Message
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Have questions? We&apos;re here to help!
              </p>
              <form className="space-y-6" onSubmit={handleSubmit}>
                  {submitStatus && (
                    <div
                      className={`p-4 rounded-lg ${
                        submitStatus.type === 'success'
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-600 focus:border-transparent transition-all"
                      placeholder="Your name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-600 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us how we can help..."
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
            </div>
            </div>

            {/* Map Section - Full Width */}
            <section className="mt-12">
            <div className="aspect-video rounded-lg overflow-hidden mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2790.5!2d-122.90848!3d46.27547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x549476b49a6e3c5d%3A0x0!2zNDbCsDE2JzMxLjciTiAxMjLCsDU0JzMwLjUiVw!5e0!3m2!1sen!2sus!4v1635782400000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Parwell Farms Location"
              ></iframe>
            </div>
            <div className="text-center">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=32+Cowlitz+Street+West,+Castle+Rock,+WA+98611"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Get Directions
              </a>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}

