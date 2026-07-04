import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, Send, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface OrderRecord {
  id: string;
  status: string;
  customer_email: string;
  customer_name: string | null;
  total_amount: number;
  shipping_cost: number | null;
  currency: string | null;
  items: any[];
  shipping_address: any;
  paystack_reference: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
}

interface NoteRecord {
  id: string;
  body: string;
  author_email: string | null;
  created_at: string;
}

interface HistoryRecord {
  id: string;
  from_status: string | null;
  to_status: string;
  changed_by_email: string | null;
  note: string | null;
  created_at: string;
}

const STATUS_CHOICES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'failed',
  'refunded',
];

// statuses that mean the order has been paid for
const PAID_STATUSES = new Set(['processing', 'shipped', 'delivered', 'completed']);
// statuses where the package has not yet left the warehouse
const UNSHIPPED_STATUSES = new Set(['pending', 'processing', 'completed']);

function statusVariant(s: string) {
  if (s === 'completed' || s === 'delivered') return 'default';
  if (s === 'shipped' || s === 'processing') return 'secondary';
  if (s === 'cancelled' || s === 'failed' || s === 'refunded') return 'destructive';
  return 'outline';
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [savingShipping, setSavingShipping] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    if (id) loadAll(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAll = async (orderId: string) => {
    setLoading(true);
    try {
      const [orderRes, notesRes, historyRes] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId).single(),
        supabase
          .from('internal_order_notes')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false }),
        supabase
          .from('order_status_history')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false }),
      ]);

      if (orderRes.error) throw orderRes.error;
      const o = orderRes.data as OrderRecord;
      setOrder(o);
      setNewStatus(o.status);
      setTrackingNumber(o.tracking_number ?? '');
      setTrackingCarrier(o.tracking_carrier ?? '');
      setNotes((notesRes.data as NoteRecord[]) ?? []);
      setHistory((historyRes.data as HistoryRecord[]) ?? []);
    } catch (err) {
      console.error('Failed to load order:', err);
      toast.error('Could not load order');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShipping = async () => {
    if (!order) return;
    const cleanedNumber = trackingNumber.trim();
    if (!cleanedNumber) {
      toast.error('Add a tracking number first');
      return;
    }

    setSavingShipping(true);
    try {
      // If the order is not yet shipped/delivered, saving tracking moves it to 'shipped'.
      const wasUnshipped = UNSHIPPED_STATUSES.has(order.status);
      const updatePayload: any = {
        tracking_number: cleanedNumber,
        tracking_carrier: trackingCarrier.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (wasUnshipped) {
        updatePayload.status = 'shipped';
        updatePayload.shipped_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', order.id);

      if (updateError) {
        console.error('Order update error:', updateError);
        toast.error(`Save failed: ${updateError.message}`);
        return;
      }

      // Fire the shipping email
      const { error: emailError } = await supabase.functions.invoke(
        'send_shipping_notification',
        { body: { order_id: order.id } },
      );

      if (emailError) {
        console.error('Email error:', emailError);
        toast.error('Tracking saved but shipping email failed to send');
      } else {
        toast.success(
          wasUnshipped
            ? 'Marked shipped and sent notification email'
            : 'Tracking updated and notification sent',
        );
      }

      await loadAll(order.id);
    } catch (err) {
      console.error('Save shipping error:', err);
      toast.error('Could not save shipping details');
    } finally {
      setSavingShipping(false);
    }
  };

  const handleStatusChange = async () => {
    if (!order || newStatus === order.status) return;
    setSavingStatus(true);
    try {
      const updatePayload: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === 'shipped' && !order.shipped_at) {
        updatePayload.shipped_at = new Date().toISOString();
      }
      if (newStatus === 'delivered' && !order.delivered_at) {
        updatePayload.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', order.id);

      if (error) {
        console.error('Status update error:', error);
        toast.error(`Could not update status: ${error.message}`);
        return;
      }

      // If moving to shipped and there's already a tracking number, fire the email too
      if (newStatus === 'shipped' && order.tracking_number) {
        await supabase.functions.invoke('send_shipping_notification', {
          body: { order_id: order.id },
        });
        toast.success('Status updated and shipping email sent');
      } else {
        toast.success('Status updated');
      }

      await loadAll(order.id);
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Could not update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!order || !newNote.trim()) return;
    setAddingNote(true);
    try {
      const { error } = await supabase.from('internal_order_notes').insert({
        order_id: order.id,
        author_id: user?.id ?? null,
        author_email: user?.email ?? null,
        body: newNote.trim(),
      });
      if (error) throw error;
      setNewNote('');
      toast.success('Note added');
      await loadAll(order.id);
    } catch (err) {
      console.error('Add note error:', err);
      toast.error('Could not add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleMarkRefunded = async () => {
    if (!order) return;
    const reason = window.prompt(
      'Reason for refund (this will be logged as an internal note):',
    );
    if (reason === null) return; // user cancelled
    if (!reason.trim()) {
      toast.error('A reason is required when marking an order refunded');
      return;
    }

    setRefunding(true);
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('id', order.id);
      if (orderError) throw orderError;

      const { error: noteError } = await supabase.from('internal_order_notes').insert({
        order_id: order.id,
        author_id: user?.id ?? null,
        author_email: user?.email ?? null,
        body: `Refund processed. Reason: ${reason.trim()}\n\nRemember to also issue the refund in the Paystack dashboard.`,
      });
      if (noteError) console.error('Refund note insert failed:', noteError);

      toast.success('Order marked as refunded');
      await loadAll(order.id);
    } catch (err) {
      console.error('Refund error:', err);
      toast.error('Could not mark order as refunded');
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading order…</p>;
  }
  if (!order) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to orders
          </Link>
        </Button>
        <p className="text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  const subtotal =
    Number(order.total_amount) - Number(order.shipping_cost ?? 0);
  const addr = order.shipping_address ?? {};
  const isPaid = PAID_STATUSES.has(order.status);
  const isRefunded = order.status === 'refunded';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
            <Link to="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Order {order.id.slice(0, 8)}…</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleString('en-GB', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>
        <Badge variant={statusVariant(order.status) as any} className="text-sm px-3 py-1">
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(order.items ?? []).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between gap-4 text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.size ? `Size ${item.size} · ` : ''}Qty {item.quantity} @ {formatPrice(Number(item.price))}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(Number(item.line_total ?? item.price * item.quantity))}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(Number(order.shipping_cost ?? 0))}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total_amount))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping & tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Tracking number</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. PXL12345678"
                  />
                </div>
                <div>
                  <Label className="text-xs">Carrier (optional)</Label>
                  <Input
                    value={trackingCarrier}
                    onChange={(e) => setTrackingCarrier(e.target.value)}
                    placeholder="e.g. PostNet, Aramex"
                  />
                </div>
              </div>
              <Button onClick={handleSaveShipping} disabled={savingShipping}>
                <Send className="h-4 w-4 mr-2" />
                {savingShipping
                  ? 'Saving…'
                  : order.tracking_number
                    ? 'Update & re-send email'
                    : 'Save & send shipping email'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Saving a tracking number automatically marks the order as shipped and sends an email
                to the customer with their tracking details.
              </p>
              <div className="text-sm space-y-1 pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipped at</span>
                  <span>{order.shipped_at ? new Date(order.shipped_at).toLocaleString('en-GB') : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered at</span>
                  <span>{order.delivered_at ? new Date(order.delivered_at).toLocaleString('en-GB') : '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Internal notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                These notes are only visible to admins. Customers never see them.
              </p>
              <div className="space-y-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this order…"
                  rows={3}
                />
                <Button size="sm" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
                  {addingNote ? 'Adding…' : 'Add note'}
                </Button>
              </div>
              <div className="space-y-3 pt-2">
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                ) : (
                  notes.map((n) => (
                    <div key={n.id} className="bg-muted/30 rounded-md p-3">
                      <p className="text-sm whitespace-pre-wrap">{n.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {n.author_email || 'Admin'} ·{' '}
                        {new Date(n.created_at).toLocaleString('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_CHOICES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusChange}
                disabled={savingStatus || newStatus === order.status}
                className="w-full"
              >
                {savingStatus ? 'Saving…' : 'Update status'}
              </Button>
              {isPaid && !isRefunded && (
                <Button
                  onClick={handleMarkRefunded}
                  disabled={refunding}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {refunding ? 'Processing…' : 'Mark as refunded'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="font-medium">{order.customer_name || '—'}</p>
                <p className="text-muted-foreground">{order.customer_email}</p>
              </div>
              {addr.phone && (
                <p className="text-muted-foreground pt-1">Phone: {addr.phone}</p>
              )}
              <div className="pt-2 border-t mt-3 space-y-0.5">
                {addr.address_line1 && <p>{addr.address_line1}</p>}
                {addr.address_line2 && <p>{addr.address_line2}</p>}
                <p>
                  {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}
                </p>
                <p>{addr.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs">{order.paystack_reference?.slice(0, 12) ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span>{order.currency ?? 'ZAR'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid at</span>
                <span>
                  {order.completed_at
                    ? new Date(order.completed_at).toLocaleDateString('en-GB')
                    : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet.</p>
              ) : (
                <ol className="space-y-3">
                  {history.map((h) => (
                    <li key={h.id} className="text-sm">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium">
                          {h.from_status ? `${h.from_status} → ${h.to_status}` : `Created (${h.to_status})`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {h.changed_by_email ? `${h.changed_by_email} · ` : ''}
                        {new Date(h.created_at).toLocaleString('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
