import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/db/supabase';
import { useCart } from '@/contexts/CartContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (reference) {
      verifyPayment();
    }
  }, [reference]);

  const verifyPayment = async () => {
    try {
      console.log('=== PAYMENT VERIFICATION START ===');
      console.log('Reference from URL:', reference);
      
      const { data, error } = await supabase.functions.invoke('verify_paystack_payment', {
        body: { reference },
      });

      console.log('Edge Function Response:', JSON.stringify(data, null, 2));
      console.log('Edge Function Error:', error);

      if (error) {
        const errorMsg = await error?.context?.text?.();
        console.error('Payment verification error:', errorMsg || error?.message);
        setVerified(false);
      } else if (data?.data?.verified || data?.verified) {
        // Handle both response structures:
        // 1. data.data.verified (wrapped by ok() function)
        // 2. data.verified (if Supabase unwraps it)
        console.log('✅ Payment verified successfully!');
        const paymentData = data?.data || data;
        console.log('Payment details:', paymentData);
        console.log('Clearing cart now...');
        setVerified(true);
        setPaymentDetails(paymentData);
        clearCart();
        console.log('✅ Cart cleared!');
      } else {
        console.error('❌ Payment not verified. Response:', data);
        setVerified(false);
      }
    } catch (err) {
      console.error('❌ Verification exception:', err);
      setVerified(false);
    } finally {
      setVerifying(false);
      console.log('=== PAYMENT VERIFICATION END ===');
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">Payment Verification Failed</h2>
            <p className="text-muted-foreground">
              We couldn't verify your payment. Please contact support if you believe this is an error.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/cart">Back to Cart</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {paymentDetails && (
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold">
                  {paymentDetails.currency?.toUpperCase()} {(paymentDetails.amount / 100).toFixed(2)}
                </span>
              </div>
              {paymentDetails.customerEmail && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-semibold">{paymentDetails.customerEmail}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-center text-muted-foreground">
            You will receive an order confirmation email shortly.
          </p>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/account/orders">View Order History</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
