import { useEffect, useState } from 'react';
import {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getStockPrice,
} from '../api/client';
import type { Investment } from '../types';
import Toggle from '../components/Toggle';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const empty = { ticker: '', shares: 0, purchase_date: '' };

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const items = await getInvestments();
      const enriched = await Promise.all(
        items.map(async (inv) => {
          try {
            const { price } = await getStockPrice(inv.ticker);
            const totalValue = inv.shares * price;
            const purchaseDate = new Date(inv.purchase_date);
            const daysDiff = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
            return { ...inv, current_price: price, total_value: totalValue, is_long_term: daysDiff > 365 };
          } catch {
            return { ...inv, current_price: undefined, total_value: undefined };
          }
        })
      );
      setInvestments(enriched);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateInvestment(editing.id, form);
      } else {
        await createInvestment(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleEdit = (inv: Investment) => {
    setEditing(inv);
    setForm({ ticker: inv.ticker, shares: inv.shares, purchase_date: inv.purchase_date });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this investment?')) return;
    await deleteInvestment(id);
    load();
  };

  const toggleInclude = async (inv: Investment) => {
    await updateInvestment(inv.id, { ...inv, included_in_zakat: !inv.included_in_zakat });
    load();
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Investment
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow space-y-4">
          <h2 className="text-lg font-semibold">{editing ? 'Edit Investment' : 'New Investment'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ticker *</label>
              <input required value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shares *</label>
              <input required type="number" step="0.001" value={form.shares} onChange={(e) => setForm({ ...form, shares: +e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Date *</label>
              <input required type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      <div className="rounded-lg bg-white shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Ticker</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Shares</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Purchase Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Current Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Total Value</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Term</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Include</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {investments.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">No investments yet.</td></tr>
            )}
            {investments.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.ticker}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">{inv.shares}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{inv.purchase_date}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {inv.current_price != null ? fmt(inv.current_price) : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {inv.total_value != null ? fmt(inv.total_value) : '—'}
                </td>
                <td className="px-6 py-4 text-center">
                  {inv.is_long_term != null && (
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${inv.is_long_term ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {inv.is_long_term ? 'Long' : 'Short'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <Toggle checked={inv.included_in_zakat} onChange={() => toggleInclude(inv)} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(inv)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
