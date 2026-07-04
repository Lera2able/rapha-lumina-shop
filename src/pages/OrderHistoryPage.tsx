import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const handleRequestRefund = (order: Order) => {
    setSelectedOrder(order);
    setRefundReason('');
    setRefundDialogOpen(true);
  };

  const handleSubmitRefund = async () => {
    if (!selectedOrder || !refundReason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('refund_requests')
        .insert({
          order_id: selectedOrder.id,
          user_id: user?.id,
          reason: refundReason,
          refund_amount: selectedOrder.total_amount,
          status: 'pending',
        });

      if (error) throw error;

      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'refund_requested' })
        .eq('id', selectedOrder.id);

      if (orderError) throw orderError;

      toast.success('Refund request submitted successfully');
      setRefundDialogOpen(false);
      loadOrders();
    } catch (error) {
      console.error('Error submitting refund request:', error);
      toast.error('Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  const canRequestRefund = (order: Order) => {
    return order.status === 'completed' && !order.status.includes('refund');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'refund_requested':
        return 'outline';
      case 'refunded':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <p className="font-medium">Sign in to view order history.</p>
          <p className="text-muted-foreground text-sm">
            Guest purchases won&apos;t appear in account history unless they were placed while signed in.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Order History</h2>

      {orders.map(order => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(order.status)}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {canRequestRefund(order) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequestRefund(order)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Request Refund
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} {item.size && `(${item.size})`} x {item.quantity}
                  </span>
                  <span>R {((item.price / 100) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>R {order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Refund Request Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedOrder && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Order #{selectedOrder.id.slice(0, 8)} - R {selectedOrder.total_amount.toFixed(2)}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="refund_reason">Reason for Refund *</Label>
              <Textarea
                id="refund_reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={4}
                placeholder="Please explain why you would like a refund..."
                required
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Your refund request will be reviewed by our team within 2-3 business days. 
              You will receive an email notification once your request has been processed.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRefund}
              disabled={submitting || !refundReason.trim()}
              className="w-full sm:w-auto"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
