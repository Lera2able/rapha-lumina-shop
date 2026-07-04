import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PageMeta from '@/components/common/PageMeta';
import { CheckCircle2, Sparkles, Heart } from 'lucide-react';

export default function RegisterThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const firstName = location.state?.firstName || 'there';

  useEffect(() => {
    // If accessed directly without state, redirect to home
    if (!location.state?.firstName) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <PageMeta
        title="Welcome | Rapha Lumina"
        description="Account registration confirmation."
        canonicalPath="/register/thank-you"
        robots="noindex,nofollow"
      />
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle2 className="relative w-16 h-16 text-primary mx-auto" />
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to Rapha Lumina, {firstName}!</CardTitle>
          <CardDescription className="text-base">
            Your journey begins here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-6">
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Account Created Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  You can now explore our collections, save your favorites, and enjoy a personalized shopping experience.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Discover Our Collections</h3>
                <p className="text-sm text-muted-foreground">
                  Browse the Enlightened and Teacher collections featuring spiritual apparel, crystals, and sacred accessories.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-4">
          <Button asChild className="w-full" size="lg">
            <Link to="/">Start Shopping</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/collections/enlightened">Explore Enlightened Collection</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
