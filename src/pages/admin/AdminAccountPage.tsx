import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function AdminAccountPage() {
  const { user, profile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (!user?.email) {
      toast.error('Could not determine your email');
      return;
    }

    setPwLoading(true);
    try {
      // Re-verify the current password by attempting a sign-in.
      // If that succeeds, we know they're the real account owner.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message || 'Could not update password');
        return;
      }

      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      toast.error('Something went wrong');
    } finally {
      setPwLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = newEmail.trim().toLowerCase();
    if (!cleaned || !cleaned.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (cleaned === user?.email) {
      toast.error('That is already your email');
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: cleaned });
      if (error) {
        toast.error(error.message || 'Could not update email');
        return;
      }
      toast.success(
        `Verification sent to ${cleaned}. Click the link to confirm the change.`,
      );
      setNewEmail('');
    } catch (err) {
      console.error('Email change error:', err);
      toast.error('Something went wrong');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold mb-1">Account</h1>
        <p className="text-muted-foreground">
          Manage your admin account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{profile?.role ?? 'unknown'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Account created</span>
            <span className="font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Use at least 8 characters. We'll verify your current password first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={pwLoading}>
              {pwLoading ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change email</CardTitle>
          <CardDescription>
            We'll send a confirmation link to the new address. The change only takes effect once you click it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <Label htmlFor="new-email">New email address</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={user?.email ?? 'name@example.com'}
                required
              />
            </div>
            <Button type="submit" disabled={emailLoading}>
              {emailLoading ? 'Sending…' : 'Send confirmation'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
