import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RequestBody {
  productId: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { productId }: RequestBody = await req.json();

    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, image_url, stock')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('Product not found:', productError);
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Check if product is actually in stock
    if (product.stock <= 0) {
      return new Response(
        JSON.stringify({ error: 'Product is still out of stock' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get all pending notifications for this product
    const { data: notifications, error: notificationsError } = await supabase
      .from('stock_notifications')
      .select('id, customer_email')
      .eq('product_id', productId)
      .is('notified_at', null);

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      throw notificationsError;
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No pending notifications for this product',
          count: 0 
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log(`Sending notifications to ${notifications.length} customers`);

    let successCount = 0;
    let failCount = 0;

    // Send email to each customer
    for (const notification of notifications) {
      try {
        // Send restock notification email
        const { error: emailError } = await supabase.functions.invoke('send_email', {
          body: {
            type: 'restock_notification',
            to: notification.customer_email,
            data: {
              productName: product.name,
              productPrice: product.price,
              productImage: product.image_url,
              productUrl: `${Deno.env.get('SITE_URL') || 'https://raphalumina.com'}/products/${product.id}`,
            },
          },
        });

        if (emailError) {
          console.error(`Failed to send email to ${notification.customer_email}:`, emailError);
          failCount++;
          continue;
        }

        // Mark notification as sent
        const { error: updateError } = await supabase
          .from('stock_notifications')
          .update({ notified_at: new Date().toISOString() })
          .eq('id', notification.id);

        if (updateError) {
          console.error(`Failed to update notification ${notification.id}:`, updateError);
        }

        successCount++;
      } catch (error) {
        console.error(`Error processing notification for ${notification.customer_email}:`, error);
        failCount++;
      }
    }

    console.log(`Notifications sent: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        total: notifications.length,
        success: successCount,
        failed: failCount,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Error in send_stock_notifications:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
