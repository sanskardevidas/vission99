import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Card, DateRange, Empty, ErrorBox, Kpi, Loading, Page, Pill, ROLE_NAME, Table, inr, useApi } from './ui';

interface Overview {
  kpis: { salesValue: number; verifiedCollections: number; outstandingBalance: number; activePartners: number };
  summary: Record<string, number>;
  monthly: { key: string; sales: number; collections: number; outstanding: number }[];
  bookingStatus: { Confirmed: number; Pending: number; Cancelled: number };
  projects: { id: string; name: string; bookings: number; salesValue: number; collections: number; outstanding: number }[];
  partnerPerformance: { id: string; name: string; role: string; personalSales: number; teamSales: number; personalCollections: number; teamCollections: number; commission: { earned: number } }[];
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Overview() {
  const [range, setRange] = useState({ from: '', to: '' });
  const { data, error } = useApi<Overview>(`/api/admin/overview?from=${range.from}&to=${range.to}`);
  if (error) return <ErrorBox text={error} />;
  if (!data) return <Loading />;
  const { kpis, summary, bookingStatus } = data;
  const totalBk = bookingStatus.Confirmed + bookingStatus.Pending + bookingStatus.Cancelled;
  const stats: [string, number | string][] = [
    ['Confirmed bookings', summary.confirmedBookings], ['Pending booking approvals', summary.pendingBookingApprovals],
    ['Pending payment verifications', summary.pendingPaymentVerifications], ['Confirmed customers', summary.confirmedCustomers],
    ['Site visits', summary.siteVisits], ['Available plots', summary.availablePlots], ['Sold plots', summary.soldPlots],
    ['Pending commission payouts', inr(summary.pendingCommissionPayouts)],
  ];
  return (
    <Page title="Dashboard" subtitle="Company-wide business overview, calculated live from the database."
      actions={<DateRange from={range.from} to={range.to} onChange={(from, to) => setRange({ from, to })} />}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi dark label="Total Sales Value" value={inr(kpis.salesValue)} hint="Approved price, confirmed bookings" />
        <Kpi label="Verified Collections" value={inr(kpis.verifiedCollections)} hint="Net of approved refunds" />
        <Kpi label="Outstanding Balance" value={inr(kpis.outstandingBalance)} hint="Sales value minus net collections" />
        <Kpi label="Active Partners" value={String(kpis.activePartners)} hint="Channel Partners, Project Partners, Managers" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="rounded-xl border border-[#E8E0D2] bg-white p-4">
            <p className="font-serif text-xl font-extrabold text-[#101010]">{v}</p>
            <p className="text-xs text-[#292929]/75">{l}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Monthly Business Overview">
          {data.monthly.every(m => !m.sales && !m.collections) ? <Empty text="No sales or collections in this period yet." /> : (
            <BarChart labels={data.monthly.map(m => MONTHS[Number(m.key.slice(5)) - 1])}
              series={[
                { name: 'Sales value', color: '#D9B66F', values: data.monthly.map(m => m.sales) },
                { name: 'Verified collections', color: '#101010', values: data.monthly.map(m => Math.max(0, m.collections)) },
                { name: 'Outstanding balance', color: '#8a7a5a', values: data.monthly.map(m => m.outstanding) },
              ]} />
          )}
        </Card>
        <Card title="Booking Status">
          <div className="space-y-4">
            {(['Confirmed', 'Pending', 'Cancelled'] as const).map(k => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-sm text-[#101010]"><span>{k}</span><strong>{bookingStatus[k]}</strong></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#F6F1E9]">
                  <div className={`h-full rounded-full ${k === 'Confirmed' ? 'bg-[#D9B66F]' : k === 'Pending' ? 'bg-[#8a7a5a]' : 'bg-[#101010]'}`} style={{ width: `${totalBk ? (bookingStatus[k] / totalBk) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
            {!totalBk && <p className="text-sm text-[#292929]/75">No bookings yet.</p>}
          </div>
        </Card>
      </div>

      <Card title="Sales by Project">
        <Table rowKey={p => p.id} empty="No projects found." rows={data.projects}
          cols={[
            { head: 'Project', cell: p => <strong>{p.name}</strong> },
            { head: 'Bookings', right: true, cell: p => p.bookings },
            { head: 'Approved sales', right: true, cell: p => inr(p.salesValue) },
            { head: 'Verified collections', right: true, cell: p => inr(p.collections) },
            { head: 'Outstanding', right: true, cell: p => inr(p.outstanding) },
          ]} />
      </Card>

      <Card title="Partner Performance" action={<Link to="/admin/dashboard/partners" className="text-sm font-semibold text-[#7A5A14] underline">All partners</Link>}>
        <Table rowKey={p => p.id} empty="No partners have registered yet." rows={data.partnerPerformance}
          cols={[
            { head: 'Partner', cell: p => <Link className="font-semibold underline" to={`/admin/dashboard/partners?open=${p.id}`}>{p.name}</Link> },
            { head: 'Partner ID', cell: p => p.id },
            { head: 'Role', cell: p => <Pill text={ROLE_NAME[p.role]} /> },
            { head: 'Personal sales', right: true, cell: p => inr(p.personalSales) },
            { head: 'Team sales', right: true, cell: p => inr(p.teamSales) },
            { head: 'Verified (personal / team)', right: true, cell: p => `${inr(p.personalCollections)} / ${inr(p.teamCollections)}` },
            { head: 'Commission', right: true, cell: p => (p.commission.earned ? inr(p.commission.earned) : '—') },
          ]} />
        <p className="mt-3 text-xs text-[#292929]/75">Each booking is counted once company-wide (to its responsible partner). Team figures show a partner’s downline and therefore overlap with their upline by design.</p>
      </Card>
    </Page>
  );
}
