const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

interface EmailRequest {
  type: 'order_confirmation' | 'shipping_update' | 'refund_approved' | 'refund_rejected' | 'refund_processed' | 'welcome' | 'restock_notification';
  to: string;
  data: {
    customerName?: string;
    firstName?: string;
    orderId?: string;
    orderDate?: string;
    items?: OrderItem[];
    totalAmount?: number;
    shippingAddress?: any;
    refundAmount?: number;
    refundReason?: string;
    adminNotes?: string;
    productName?: string;
    productPrice?: number;
    productImage?: string;
    productUrl?: string;
  };
}

function getEmailSubject(type: string): string {
  switch (type) {
    case 'welcome':
      return 'Welcome to Rapha Lumina - Your Spiritual Journey Begins';
    case 'order_confirmation':
      return 'Order Confirmation - Rapha Lumina';
    case 'shipping_update':
      return 'Your Order Has Been Shipped - Rapha Lumina';
    case 'refund_approved':
      return 'Refund Request Approved - Rapha Lumina';
    case 'refund_rejected':
      return 'Refund Request Update - Rapha Lumina';
    case 'refund_processed':
      return 'Refund Processed - Rapha Lumina';
    case 'restock_notification':
      return 'Back in Stock - Rapha Lumina';
    default:
      return 'Notification from Rapha Lumina';
  }
}

function generateOrderConfirmationEmail(data: any): string {
  const itemsHtml = (data.items || []).map((item: OrderItem) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 500; color: #111827;">${item.name}</div>
        ${item.size ? `<div style="font-size: 14px; color: #6b7280;">Size: ${item.size}</div>` : ''}
        <div style="font-size: 14px; color: #6b7280;">Quantity: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">
        R ${((item.price ?? 0) * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Rapha Lumina</h1>
                  <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Wear Your Purpose</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">Thank You for Your Order!</h2>
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    Hi ${data.customerName || 'there'},
                  </p>
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    We've received your order and are preparing it for shipment. You'll receive another email when your order has been dispatched.
                  </p>
                  
                  <!-- Order Details -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Order Details</h3>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Order ID:</strong> ${data.orderId}
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      <strong>Order Date:</strong> ${data.orderDate}
                    </p>
                  </div>
                  
                  <!-- Order Items -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <thead>
                      <tr>
                        <th style="padding: 12px 0; border-bottom: 2px solid #e5e7eb; text-align: left; color: #111827; font-weight: 600;">Item</th>
                        <th style="padding: 12px 0; border-bottom: 2px solid #e5e7eb; text-align: right; color: #111827; font-weight: 600;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                      <tr>
                        <td style="padding: 16px 0; font-weight: 600; color: #111827; font-size: 18px;">Total</td>
                        <td style="padding: 16px 0; text-align: right; font-weight: 600; color: #111827; font-size: 18px;">R ${(data.totalAmount ?? 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  ${data.shippingAddress ? `
                  <!-- Shipping Address -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Shipping Address</h3>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      ${data.shippingAddress.name}<br>
                      ${data.shippingAddress.address_line1}<br>
                      ${data.shippingAddress.address_line2 ? `${data.shippingAddress.address_line2}<br>` : ''}
                      ${data.shippingAddress.city}, ${data.shippingAddress.state}<br>
                      ${data.shippingAddress.postal_code}, ${data.shippingAddress.country}
                    </p>
                  </div>
                  ` : ''}
                  
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    If you have any questions about your order, please don't hesitate to contact us at <a href="mailto:support@raphalumina.com" style="color: #f59e0b; text-decoration: none;">support@raphalumina.com</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 32px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                    © 2026 Rapha Lumina. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    This email was sent to ${data.shippingAddress?.email || 'you'} regarding your recent order.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateShippingUpdateEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Rapha Lumina</h1>
                  <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Wear Your Purpose</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">Your Order Has Been Shipped!</h2>
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    Hi ${data.customerName || 'there'},
                  </p>
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    Great news! Your order has been dispatched and is on its way to you. You should receive it within 3-5 business days.
                  </p>
                  
                  <!-- Order Details -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Order Details</h3>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Order ID:</strong> ${data.orderId}
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      <strong>Total Amount:</strong> R ${(data.totalAmount ?? 0).toFixed(2)}
                    </p>
                  </div>
                  
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    If you have any questions about your delivery, please contact us at <a href="mailto:support@raphalumina.com" style="color: #f59e0b; text-decoration: none;">support@raphalumina.com</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 32px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                    © 2026 Rapha Lumina. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateRefundEmail(type: string, data: any): string {
  let title = '';
  let message = '';
  
  if (type === 'refund_approved') {
    title = 'Refund Request Approved';
    message = 'Your refund request has been approved. We will process the refund within 5-10 business days.';
  } else if (type === 'refund_rejected') {
    title = 'Refund Request Update';
    message = 'After reviewing your refund request, we are unable to process it at this time.';
  } else if (type === 'refund_processed') {
    title = 'Refund Processed';
    message = 'Your refund has been processed and the amount will be credited to your original payment method within 5-10 business days.';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Rapha Lumina</h1>
                  <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Wear Your Purpose</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">${title}</h2>
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    Hi ${data.customerName || 'there'},
                  </p>
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    ${message}
                  </p>
                  
                  <!-- Refund Details -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">Refund Details</h3>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Order ID:</strong> ${data.orderId}
                    </p>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                      <strong>Refund Amount:</strong> R ${(data.refundAmount ?? 0).toFixed(2)}
                    </p>
                    ${data.adminNotes ? `
                    <p style="margin: 16px 0 0; color: #6b7280; font-size: 14px;">
                      <strong>Note from our team:</strong><br>
                      ${data.adminNotes}
                    </p>
                    ` : ''}
                  </div>
                  
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    If you have any questions, please contact us at <a href="mailto:support@raphalumina.com" style="color: #f59e0b; text-decoration: none;">support@raphalumina.com</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 32px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                    © 2026 Rapha Lumina. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateWelcomeEmail(data: any): string {
  const firstName = data.firstName || 'there';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to Rapha Lumina</h1>
                  <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Wear Your Purpose</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">Hello ${firstName}! ✨</h2>
                  
                  <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Thank you for joining the Rapha Lumina community. Your spiritual journey begins here, and we're honored to be part of it.
                  </p>
                  
                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    We've curated a special collection of spiritual wellness apparel and practical educator accessories to support your purpose-driven life.
                  </p>
                  
                  <!-- Features -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">What You Can Do:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
                      <li>Browse our Enlightened Collection (spiritual wellness apparel)</li>
                      <li>Explore our Teacher Collection (practical classroom tools and accessories)</li>
                      <li>Save your favorite items for later</li>
                      <li>Track your orders</li>
                      <li>Receive exclusive offers and updates</li>
                    </ul>
                  </div>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <a href="https://raphalumina.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Start Shopping
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you have any questions, feel free to reach out to us at <a href="mailto:support@raphalumina.com" style="color: #f59e0b; text-decoration: none;">support@raphalumina.com</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center; line-height: 1.6;">
                    © ${new Date().getFullYear()} Rapha Lumina. All rights reserved.<br>
                    Wear Your Purpose
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateRestockNotificationEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Rapha Lumina</h1>
                  <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Wear Your Purpose</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">Good News! Your Item is Back in Stock</h2>
                  <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    The item you requested a notification for is now available again!
                  </p>
                  
                  <!-- Product Card -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px; display: flex; align-items: center;">
                    ${data.productImage ? `
                    <img src="${data.productImage}" alt="${data.productName}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; margin-right: 24px;">
                    ` : ''}
                    <div>
                      <h3 style="margin: 0 0 8px; color: #111827; font-size: 20px; font-weight: 600;">${data.productName}</h3>
                      <p style="margin: 0 0 16px; color: #f59e0b; font-size: 24px; font-weight: 700;">R ${(data.productPrice ?? 0).toFixed(2)}</p>
                      <a href="${data.productUrl}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Shop Now
                      </a>
                    </div>
                  </div>
                  
                  <p style="margin: 0 0 16px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    Don't wait too long - popular items sell out quickly!
                  </p>
                  
                  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you have any questions, please contact us at <a href="mailto:support@raphalumina.com" style="color: #f59e0b; text-decoration: none;">support@raphalumina.com</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 32px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                    © 2026 Rapha Lumina. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    You received this email because you requested to be notified when this item was back in stock.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateEmailHtml(type: string, data: any): string {
  switch (type) {
    case 'welcome':
      return generateWelcomeEmail(data);
    case 'order_confirmation':
      return generateOrderConfirmationEmail(data);
    case 'shipping_update':
      return generateShippingUpdateEmail(data);
    case 'refund_approved':
    case 'refund_rejected':
    case 'refund_processed':
      return generateRefundEmail(type, data);
    case 'restock_notification':
      return generateRestockNotificationEmail(data);
    default:
      return '';
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailRequest: EmailRequest = await req.json();
    const { type, to, data } = emailRequest;

    const subject = getEmailSubject(type);
    const html = generateEmailHtml(type, data);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rapha Lumina <support@raphalumina.com>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API error: ${error.message || 'Unknown error'}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ code: "SUCCESS", message: "Email sent successfully", data: result }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ code: "FAIL", message: error instanceof Error ? error.message : "Failed to send email" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
