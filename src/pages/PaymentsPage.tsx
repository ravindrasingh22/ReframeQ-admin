const payments = [
  { id: 'INV-1048', user: 'Maya Shah', plan: 'Family Plus', amount: '$29.00', status: 'Paid' },
  { id: 'INV-1049', user: 'Arjun Nair', plan: 'Starter', amount: '$9.00', status: 'Pending' },
  { id: 'INV-1050', user: 'Leah Carter', plan: 'Family Plus', amount: '$29.00', status: 'Failed' }
];

export function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Billing</h2>
        <p className="mt-1 text-sm text-slate-500">Plans, entitlements, invoices, and payment operations.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Monthly recurring revenue</p>
          <p className="mt-2 text-2xl font-semibold">$18,420</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending invoices</p>
          <p className="mt-2 text-2xl font-semibold">23</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Failed payments</p>
          <p className="mt-2 text-2xl font-semibold">8</p>
        </article>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {payments.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{row.id}</td>
                <td className="px-4 py-3 text-slate-600">{row.user}</td>
                <td className="px-4 py-3 text-slate-600">{row.plan}</td>
                <td className="px-4 py-3 text-slate-600">{row.amount}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
