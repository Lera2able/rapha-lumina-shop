import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert directly into contact_submissions table
      // Database trigger will automatically email on every submission
      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          message: formData.message.trim(),
        });

      if (error) {
        console.error('Contact form error:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact form submission error:', err);
      toast.error('Failed to send message. Please try again or email us directly at support@raphalumina.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-balance">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-pretty">
                  Have questions about our products or need assistance with your order? We're here to help!
                </p>
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">support@raphalumina.com</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-muted-foreground">079 333 0455</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 5:00 PM SAST</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Business</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Rapha Lumina (Pty) Ltd</p>
                  <p>Registration: 2024/620336/07</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Registered address</p>
                  <p>28 Heide Street</p>
                  <p>Highveld Park</p>
                  <p>Witbank, 1034</p>
                  <p>South Africa</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
