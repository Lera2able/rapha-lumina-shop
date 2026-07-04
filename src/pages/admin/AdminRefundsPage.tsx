import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RefundRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  refund_amount: number;
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    customer_email: string;
    total_amount: number;
  };
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter]);

  const fetchRefunds = async () => {
    try {
      let query = supabase
        .from('refund_requests')
        .select(`
          *,
          order:orders(id, customer_email, total_amount)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRefunds(data || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRefund = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setAdminNotes(refund.admin_notes || '');
    setDialogOpen(true);
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected' | 'processed') => {
    if (!selectedRefund) return;

    setProcessing(true);
    try {
      const { error: refundError } = await supabase
        .from('refund_requests')
        .update({
          status,
          admin_notes: adminNotes,
          processed_at: status === 'processed' ? new Date().toISOString() : null,
        })
        .eq('id', selectedRefund.id);

      if (refundError) throw refundError;

      if (status === 'processed') {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('id', selectedRefund.order_id);

        if (orderError) throw orderError;
      }

      if (selectedRefund.order?.customer_email) {
        try {
          let emailType = 'refund_approved';
          if (status === 'rejected') emailType = 'refund_rejected';
          if (status === 'processed') emailType = 'refund_processed';

          await supabase.functions.invoke('send_email', {
            body: {
              type: emailType,
              to: selectedRefund.order.customer_email,
              data: {
                customerName: 'Customer',
                orderId: selectedRefund.order_id.slice(0, 8),
                refundAmount: selectedRefund.refund_amount,
                adminNotes: adminNotes,
              },
            },
          });
          toast.success(`Refund ${status} and notification sent`);
        } catch (emailError) {
          console.error('Failed to send refund email:', emailError);
          toast.success(`Refund ${status} (email notification failed)`);
        }
      } else {
        toast.success(`Refund request ${status}`);
      }

      setDialogOpen(false);
      fetchRefunds();
    } catch (error) {
      console.error('Error updating refund:', error);
      toast.error('Failed to update refund request');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Refund Requests</h1>
        <Button onClick={fetchRefunds} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Request ID</TableHead>
                  <TableHead className="whitespace-nowrap">Customer</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No refund requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  refunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell className="whitespace-nowrap font-mono text-sm">
                        {refund.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {refund.order?.customer_email || 'N/A'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(refund.created_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-semibold">
                        R {refund.refund_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge className={getStatusColor(refund.status)}>
                          {refund.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRefund(refund)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Refund Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Refund Request Details</DialogTitle>
          </DialogHeader>

          {selectedRefund && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Request ID</p>
                  <p className="font-mono text-sm">{selectedRefund.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedRefund.status)}>
                    {selectedRefund.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Email</p>
                  <p>{selectedRefund.order?.customer_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                  <p className="font-semibold">R {selectedRefund.refund_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p>{formatDate(selectedRefund.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{selectedRefund.order_id.slice(0, 8)}...</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Customer Reason</p>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm">{selectedRefund.reason}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about this refund request..."
                  disabled={selectedRefund.status === 'processed'}
                />
              </div>

              {selectedRefund.status === 'pending' && (
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={processing}
                    className="w-full sm:w-auto"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={processing}
                    className="w-full sm:w-auto"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}

              {selectedRefund.status === 'approved' && (
                <DialogFooter>
                  <Button
                    onClick={() => handleUpdateStatus('processed')}
                    disabled={processing}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Processed
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
