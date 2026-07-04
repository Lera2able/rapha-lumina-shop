import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/db/supabase';
import { Copy, Download, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface BuyerRow {
  email: string;
  customer_name: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
  is_guest: boolean;
}

interface SubscriberRow {
  email: string;
  subscribed_at: string;
  source?: string | null;
}

type SegmentKey =
  | 'all-buyers'
  | 'all-subscribers'
  | 'subscribers-non-buyers'
  | 'buyers-not-subscribed'
  | 'guest-buyers';

interface CampaignRow {
  email: string;
  name: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  subscribed: boolean;
  subscriber_source: string | null;
  is_guest: boolean;
}

export default function AdminCampaignHubPage() {
  const [buyers, setBuyers] = useState<BuyerRow[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('all-buyers');

  useEffect(() => {
    loadAudienceData();
  }, []);

  const loadAudienceData = async () => {
    setLoading(true);
    try {
      const [ordersRes, subscribersRes] = await Promise.all([
        supabase
          .from('orders')
          .select('user_id, customer_email, customer_name, total_amount, created_at, status')
          .in('status', ['processing', 'shipped', 'delivered', 'completed'])
          .order('created_at', { ascending: false }),
        supabase
          .from('newsletter_subscribers')
          .select('email, subscribed_at, source')
          .order('subscribed_at', { ascending: false }),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (subscribersRes.error) throw subscribersRes.error;

      const buyerMap = new Map<string, BuyerRow>();
      for (const order of ordersRes.data ?? []) {
        const email = (order as any).customer_email?.toLowerCase();
        if (!email) continue;

        const existing = buyerMap.get(email);
        if (existing) {
          existing.total_orders += 1;
          existing.total_spent += Number((order as any).total_amount || 0);
          if (new Date((order as any).created_at) > new Date(existing.last_order_at)) {
            existing.last_order_at = (order as any).created_at;
            existing.customer_name = (order as any).customer_name ?? existing.customer_name;
          }
        } else {
          buyerMap.set(email, {
            email,
            customer_name: (order as any).customer_name ?? null,
            total_orders: 1,
            total_spent: Number((order as any).total_amount || 0),
            last_order_at: (order as any).created_at,
            is_guest: !(order as any).user_id,
          });
        }
      }

      setBuyers([...buyerMap.values()].sort((a, b) => b.total_spent - a.total_spent));
      setSubscribers((subscribersRes.data ?? []).map((row) => ({
        email: row.email.toLowerCase(),
        subscribed_at: row.subscribed_at,
        source: row.source ?? null,
      })));
    } catch (error) {
      console.error('Failed to load campaign audience data:', error);
      toast.error('Could not load campaign hub');
    } finally {
      setLoading(false);
    }
  };

  const campaignRows = useMemo(() => {
    const subscriberMap = new Map(subscribers.map((row) => [row.email, row]));
    const buyerMap = new Map(buyers.map((row) => [row.email, row]));
    const allEmails = new Set([...buyerMap.keys(), ...subscriberMap.keys()]);

    const rows: CampaignRow[] = [...allEmails].map((email) => {
      const buyer = buyerMap.get(email);
      const subscriber = subscriberMap.get(email);
      return {
        email,
        name: buyer?.customer_name ?? null,
        total_orders: buyer?.total_orders ?? 0,
        total_spent: buyer?.total_spent ?? 0,
        last_order_at: buyer?.last_order_at ?? null,
        subscribed: Boolean(subscriber),
        subscriber_source: subscriber?.source ?? null,
        is_guest: buyer?.is_guest ?? false,
      };
    });

    const searchTerm = search.trim().toLowerCase();
    const filteredBySegment = rows.filter((row) => {
      switch (activeSegment) {
        case 'all-buyers':
          return row.total_orders > 0;
        case 'all-subscribers':
          return row.subscribed;
        case 'subscribers-non-buyers':
          return row.subscribed && row.total_orders === 0;
        case 'buyers-not-subscribed':
          return row.total_orders > 0 && !row.subscribed;
        case 'guest-buyers':
          return row.total_orders > 0 && row.is_guest;
        default:
          return true;
      }
    });

    const searched = searchTerm
      ? filteredBySegment.filter(
          (row) =>
            row.email.includes(searchTerm) ||
            (row.name?.toLowerCase().includes(searchTerm) ?? false) ||
            (row.subscriber_source?.toLowerCase().includes(searchTerm) ?? false),
        )
      : filteredBySegment;

    return searched.sort((a, b) => {
      if (b.total_orders !== a.total_orders) return b.total_orders - a.total_orders;
      if (b.total_spent !== a.total_spent) return b.total_spent - a.total_spent;
      return a.email.localeCompare(b.email);
    });
  }, [buyers, subscribers, activeSegment, search]);

  const segmentCounts = useMemo(
    () => ({
      'all-buyers': buyers.length,
      'all-subscribers': subscribers.length,
      'subscribers-non-buyers': subscribers.filter((row) => !buyers.some((buyer) => buyer.email === row.email)).length,
      'buyers-not-subscribed': buyers.filter((row) => !subscribers.some((subscriber) => subscriber.email === row.email)).length,
      'guest-buyers': buyers.filter((row) => row.is_guest).length,
    }),
    [buyers, subscribers],
  );

  const segmentMeta: Array<{ key: SegmentKey; label: string }> = [
    { key: 'all-buyers', label: 'All buyers' },
    { key: 'all-subscribers', label: 'All subscribers' },
    { key: 'subscribers-non-buyers', label: 'Subscribers not buying' },
    { key: 'buyers-not-subscribed', label: 'Buyers not subscribed' },
    { key: 'guest-buyers', label: 'Guest buyers' },
  ];

  const emailList = campaignRows.map((row) => row.email).join(', ');

  const handleCopyEmails = async () => {
    try {
      await navigator.clipboard.writeText(emailList);
      toast.success('Campaign emails copied');
    } catch (error) {
      console.error('Failed to copy campaign emails:', error);
      toast.error('Could not copy campaign emails');
    }
  };

  const handleExportCsv = () => {
    const lines = [
      ['email', 'name', 'orders', 'lifetime_spend', 'subscribed', 'subscriber_source', 'guest_buyer', 'last_order_at'].join(','),
      ...campaignRows.map((row) =>
        [
          row.email,
          `"${(row.name ?? '').replace(/"/g, '""')}"`,
          row.total_orders,
          row.total_spent.toFixed(2),
          row.subscribed ? 'yes' : 'no',
          row.subscriber_source ?? '',
          row.is_guest ? 'yes' : 'no',
          row.last_order_at ?? '',
        ].join(','),
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapha-lumina-${activeSegment}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Megaphone className="h-7 w-7" /> Campaign Hub
        </h1>
        <p className="text-muted-foreground">
          Use buyer and subscriber segments for campaigns, launches, and win-back emails.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Active segment</p>
            <p className="text-2xl font-bold mt-2">{segmentCounts[activeSegment]}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {segmentMeta.find((segment) => segment.key === activeSegment)?.label}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Audience totals</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline">Buyers: {buyers.length}</Badge>
              <Badge variant="outline">Subscribers: {subscribers.length}</Badge>
              <Badge variant="outline">Guest buyers: {segmentCounts['guest-buyers']}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Campaign tools</p>
              <p className="text-sm text-muted-foreground mt-1">Copy or export the active segment</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyEmails} disabled={!campaignRows.length}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button size="sm" onClick={handleExportCsv} disabled={!campaignRows.length}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-xs">Search</Label>
            <Input
              placeholder="Email, name, or source"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {segmentMeta.map((segment) => (
              <button
                key={segment.key}
                type="button"
                className="px-4 py-2 rounded-full text-[10px] tracking-[0.14em] uppercase transition-colors border"
                style={{
                  backgroundColor: activeSegment === segment.key ? 'var(--rl-espresso)' : 'transparent',
                  color: activeSegment === segment.key ? 'var(--rl-cream)' : 'var(--rl-espresso)',
                  borderColor: 'rgba(26, 18, 8, 0.12)',
                }}
                onClick={() => setActiveSegment(segment.key)}
              >
                {segment.label} ({segmentCounts[segment.key]})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-right">Orders</th>
                <th className="p-3 text-right">Spend</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Last order</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Loading campaign data…
                  </td>
                </tr>
              ) : campaignRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No audience found for this segment.
                  </td>
                </tr>
              ) : (
                campaignRows.map((row) => (
                  <tr key={`${activeSegment}-${row.email}`} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <p className="font-medium">{row.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </td>
                    <td className="p-3 text-right">{row.total_orders}</td>
                    <td className="p-3 text-right font-medium">R {row.total_spent.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {row.subscribed && <Badge variant="outline">subscriber</Badge>}
                        {row.total_orders > 0 && <Badge variant="outline">buyer</Badge>}
                        {row.is_guest && <Badge variant="outline">guest</Badge>}
                        {row.subscriber_source && <Badge variant="outline">{row.subscriber_source}</Badge>}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {row.last_order_at
                        ? new Date(row.last_order_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
