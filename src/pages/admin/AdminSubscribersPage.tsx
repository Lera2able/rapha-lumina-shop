import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/db/supabase';
import { Copy, Download, MailPlus } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriberRow {
  id: string;
  email: string;
  subscribed_at: string;
  source?: string | null;
}

export default function AdminSubscribersPage() {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, subscribed_at, source')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setRows(data ?? []);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
      toast.error('Could not load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.email.toLowerCase().includes(q) || (row.source ?? '').toLowerCase().includes(q));
  }, [rows, search]);

  const sourceCounts = useMemo(() => {
    return filtered.reduce<Record<string, number>>((acc, row) => {
      const key = row.source || 'unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [filtered]);

  const handleCopyEmails = async () => {
    try {
      await navigator.clipboard.writeText(filtered.map((row) => row.email).join(', '));
      toast.success('Subscriber emails copied');
    } catch (error) {
      console.error('Failed to copy subscriber emails:', error);
      toast.error('Could not copy subscriber emails');
    }
  };

  const handleExportCsv = () => {
    const lines = [
      ['email', 'source', 'subscribed_at'].join(','),
      ...filtered.map((row) =>
        [
          row.email,
          row.source ?? 'unknown',
          row.subscribed_at,
        ].join(','),
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapha-lumina-newsletter-subscribers.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
          <MailPlus className="h-7 w-7" /> Subscribers
        </h1>
        <p className="text-muted-foreground">
          Newsletter emails for campaigns, segmented by signup source.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Subscriber emails</p>
            <p className="text-2xl font-bold mt-2">{filtered.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Ready for campaign exports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Sources</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(sourceCounts).length > 0 ? (
                Object.entries(sourceCounts).map(([source, count]) => (
                  <Badge key={source} variant="outline">
                    {source}: {count}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No subscriber data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Campaign tools</p>
              <p className="text-sm text-muted-foreground mt-1">Copy or export the filtered list</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyEmails} disabled={!filtered.length}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button size="sm" onClick={handleExportCsv} disabled={!filtered.length}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Label className="text-xs">Search</Label>
          <Input
            placeholder="Email or source"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Source</th>
                <th className="p-3 text-left">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    Loading subscribers…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{row.email}</td>
                    <td className="p-3">
                      <Badge variant="outline">{row.source || 'unknown'}</Badge>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {new Date(row.subscribed_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
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
