import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const MAIL_FROM_NAME = Deno.env.get('MAIL_FROM_NAME') ?? 'Rapha Lumina';
const MAIL_FROM_EMAIL = Deno.env.get('MAIL_FROM_EMAIL') ?? 'support@raphalumina.com';
const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') ?? 'support@raphalumina.com';
const CONTACT_NOTIFICATION_EMAIL = Deno.env.get('CONTACT_NOTIFICATION_EMAIL') ?? SUPPORT_EMAIL;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { name, email, message }: ContactFormData = await req.json();

    // Validate input
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save to database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        message,
        status: 'new',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save contact submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email notification via Resend
    if (RESEND_API_KEY) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #D4A84A 0%, #B8923D 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; }
                .field { margin-bottom: 20px; }
                .label { font-weight: 600; color: #18140F; margin-bottom: 5px; }
                .value { color: #4a4a4a; padding: 10px; background: #f9f9f9; border-radius: 4px; }
                .message-box { background: #f9f9f9; padding: 15px; border-left: 4px solid #D4A84A; border-radius: 4px; white-space: pre-wrap; }
                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
                .button { display: inline-block; background: #D4A84A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Rapha Lumina</p>
                </div>
                <div class="content">
                  <p>You have received a new contact form submission from your website.</p>
                  
                  <div class="field">
                    <div class="label">From:</div>
                    <div class="value">${name}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value"><a href="mailto:${email}">${email}</a></div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Message:</div>
                    <div class="message-box">${message}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Submitted:</div>
                    <div class="value">${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })} SAST</div>
                  </div>
                  
                  <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666;">
                    <strong>Quick Reply:</strong> Simply reply to this email to respond directly to ${name}.
                  </p>
                </div>
                <div class="footer">
                  <p>This is an automated notification from your Rapha Lumina contact form.</p>
                  <p>Submission ID: ${submission.id}</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const emailText = `
New Contact Form Submission - Rapha Lumina

From: ${name}
Email: ${email}
Submitted: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })} SAST

Message:
${message}

---
Reply to this email to respond directly to ${name}.
Submission ID: ${submission.id}
        `;

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${MAIL_FROM_NAME} <${MAIL_FROM_EMAIL}>`,
            to: [CONTACT_NOTIFICATION_EMAIL],
            reply_to: email,
            subject: `New Contact Form: ${name}`,
            html: emailHtml,
            text: emailText,
          }),
        });

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          console.error('Resend API error:', {
            status: resendResponse.status,
            from: MAIL_FROM_EMAIL,
            notify: CONTACT_NOTIFICATION_EMAIL,
            errorText,
          });
          // Don't fail the request if email fails - submission is already saved
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails - submission is already saved
      }
    } else {
      console.warn('RESEND_API_KEY not configured - email notification skipped', {
        notify: CONTACT_NOTIFICATION_EMAIL,
      });
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        id: submission.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
