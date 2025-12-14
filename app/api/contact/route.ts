import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // HTML escape function to prevent XSS attacks
    const escapeHtml = (str: string): string => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return str.replace(/[&<>"']/g, (char) => map[char]);
    };

    // Sanitize inputs (trim and limit length)
    const sanitize = (str: string) => str.trim().slice(0, 5000);
    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedMessage = sanitize(message);

    // HTML-escape all user inputs before inserting into HTML template
    const escapedName = escapeHtml(sanitizedName);
    const escapedEmail = escapeHtml(sanitizedEmail);
    const escapedMessage = escapeHtml(sanitizedMessage);

    // Use Resend to send email
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      // Resend not configured - log to console for development
      console.log('[Contact] Resend API key not set, logging message:', {
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json({
        success: true,
        message: 'Thank you! Your message has been received. (Note: Email service not configured - message logged to console)',
      });
    }

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      // Use onboarding@resend.dev - works without domain verification
      // For production, verify your domain in Resend and use a custom from email
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const toEmail = process.env.CONTACT_FORM_EMAIL || 'life@parwellfarms.com';
      
      console.log('[Contact] Sending email with:', {
        from: fromEmail,
        to: toEmail,
        hasApiKey: !!resendApiKey,
      });

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        // Don't use replyTo with onboarding@resend.dev - it requires verification
        // replyTo: sanitizedEmail,
        subject: `Contact Form: ${sanitizedName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568; border-bottom: 2px solid #8b7355; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong style="color: #2d3748;">Name:</strong> <span style="color: #4a5568;">${escapedName}</span></p>
              <p style="margin: 10px 0;"><strong style="color: #2d3748;">Email:</strong> <span style="color: #4a5568;">${escapedEmail}</span></p>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #8b7355; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong style="color: #2d3748;">Message:</strong></p>
              <p style="color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${escapedMessage.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #4a5568; font-size: 14px;"><strong>Reply to:</strong> <a href="mailto:${encodeURIComponent(sanitizedEmail)}" style="color: #8b7355; text-decoration: none;">${escapedEmail}</a></p>
            </div>
            <p style="color: #718096; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              This message was sent from the Parwell Farms contact form.
            </p>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${sanitizedName}
Email: ${sanitizedEmail}

Message:
${sanitizedMessage}

---
Reply to: ${sanitizedEmail}

This message was sent from the Parwell Farms contact form.
        `,
      });

      if (error) {
        console.error('[Contact] Resend error details:', JSON.stringify(error, null, 2));
        console.error('[Contact] Resend error type:', typeof error);
        console.error('[Contact] Resend error keys:', Object.keys(error || {}));
        
        // Provide more detailed error message
        const errorMessage = error.message || error.toString() || 'Failed to send email';
        throw new Error(`Resend API error: ${errorMessage}`);
      }

      console.log('[Contact] Email sent successfully:', data?.id);
      console.log('[Contact] Email details:', {
        from: fromEmail,
        to: toEmail,
        subject: `Contact Form: ${sanitizedName}`,
      });

      return NextResponse.json({
        success: true,
        message: 'Thank you! Your message has been sent.',
      });
    } catch (resendError: any) {
      console.error('[Contact] Error sending email via Resend:', resendError);
      console.error('[Contact] Error stack:', resendError?.stack);
      console.error('[Contact] Error message:', resendError?.message);
      console.error('[Contact] Full error object:', JSON.stringify(resendError, Object.getOwnPropertyNames(resendError), 2));
      
      // Still log the message even if email fails
      console.log('[Contact] Message details:', {
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
        timestamp: new Date().toISOString(),
      });

      // Provide more helpful error message
      const errorMessage = resendError?.message || 'Unknown error';
      const errorLower = errorMessage.toLowerCase();
      
      let userMessage = 'Failed to send email. Please try again or contact us directly at life@parwellfarms.com';
      
      if (errorLower.includes('domain') || errorLower.includes('not verified') || errorLower.includes('verify')) {
        userMessage = 'Domain not verified. To use a custom domain, verify it in Resend dashboard under "Domains". For now, using onboarding@resend.dev should work. If you see this error, check that your RESEND_FROM_EMAIL is set to onboarding@resend.dev or a verified domain.';
      } else if (errorLower.includes('api key') || errorLower.includes('unauthorized') || errorLower.includes('invalid')) {
        userMessage = 'Invalid API key. Please check your RESEND_API_KEY in .env.local';
      } else if (errorLower.includes('rate limit') || errorLower.includes('too many')) {
        userMessage = 'Too many requests. Please wait a moment and try again.';
      } else {
        userMessage = `Failed to send email: ${errorMessage}. Please try again or contact us directly at life@parwellfarms.com`;
      }

      // Return error to user
      return NextResponse.json(
        { 
          error: userMessage,
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Contact] Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

