import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get reference from URL (could be 'reference', 'trxref', or 'transaction')
    const reference = searchParams.get('reference') || 
                     searchParams.get('trxref') || 
                     searchParams.get('transaction');

    console.log('=== PAYMENT CALLBACK PAGE ===');
    console.log('All URL params:', Object.fromEntries(searchParams.entries()));
    console.log('Reference found:', reference);

    if (reference) {
      // Redirect to payment success page with reference
      console.log('Redirecting to payment-success with reference:', reference);
      navigate(`/payment-success?reference=${reference}`, { replace: true });
    } else {
      console.error('No reference found in callback URL');
      // Redirect to cart if no reference
      navigate('/cart', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <PageMeta
        title="Processing Payment | Rapha Lumina"
        description="Processing your Rapha Lumina payment."
        canonicalPath="/payment-callback"
        robots="noindex,nofollow"
      />
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Processing payment...</h2>
        <p className="text-muted-foreground">Please wait while we verify your payment.</p>
      </div>
    </div>
  );
}
