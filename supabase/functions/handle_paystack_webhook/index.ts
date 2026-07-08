import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')!;
const supportEmail = Deno.env.get('SUPPORT_EMAIL') ?? 'support@raphalumina.com';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get the signature from headers
    const signature = req.headers.get('x-paystack-signature');
    if (!signature) {
      console.error('No signature provided');
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the raw body
    const body = await req.text();

    // Verify the signature
    const hash = createHmac('sha512', paystackSecretKey)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse the event
    const event = JSON.parse(body);
    console.log('Webhook event:', event.event);

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      console.log('Processing successful charge:', reference);

      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_reference', reference)
        .maybeSingle();

      if (existingOrder) {
        console.log('Order already exists for reference:', reference);
        return new Response(JSON.stringify({ message: 'Order already processed' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Extract order details from metadata
      const { email, items, shippingAddress, shippingCost, userId } = metadata;

      if (!email || !items || !shippingAddress) {
        console.error('Missing required metadata');
        return new Response(JSON.stringify({ error: 'Missing metadata' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Parse items if it's a string
      const orderItems = typeof items === 'string' ? JSON.parse(items) : items;
      const parsedShippingAddress = typeof shippingAddress === 'string' 
        ? JSON.parse(shippingAddress) 
        : shippingAddress;

      // Calculate total
      const subtotal = orderItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      const totalAmount = subtotal + (shippingCost || 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId || null,
          customer_email: email,
          status: 'completed',
          items: orderItems,
          total_amount: totalAmount,
          shipping_cost: shippingCost || 0,
          shipping_address: parsedShippingAddress,
          payment_reference: reference,
          payment_method: 'paystack',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      console.log('Order created:', order.id);

      // Update product inventory
      for (const item of orderItems) {
        const { error: updateError } = await supabase.rpc('decrement_stock', {
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          selected_size: item.size || null,
        });

        if (updateError) {
          console.error('Error updating inventory for product:', item.id, updateError);
        }
      }

      // Send confirmation email
      try {
        const emailPayload = {
          customerName: parsedShippingAddress.name,
          customerEmail: email,
          orderId: order.id.slice(0, 8),
          items: orderItems,
          totalAmount,
          shippingCost: shippingCost || 0,
          shippingAddress: parsedShippingAddress,
          paymentMethod: 'paystack',
        };

        await supabase.functions.invoke('send_email', {
          body: {
            type: 'order_confirmation',
            to: email,
            data: emailPayload,
          },
        });

        await supabase.functions.invoke('send_email', {
          body: {
            type: 'admin_order_notification',
            to: supportEmail,
            data: emailPayload,
          },
        });
        console.log('Confirmation email sent');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the webhook if email fails
      }

      return new Response(
        JSON.stringify({ 
          message: 'Webhook processed successfully',
          orderId: order.id 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // For other events, just acknowledge
    return new Response(JSON.stringify({ message: 'Event received' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
