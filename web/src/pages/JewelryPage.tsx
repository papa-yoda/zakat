import { useEffect, useState } from 'react';
import {
  getJewelry,
  createJewelry,
  updateJewelry,
  deleteJewelry,
  getMetalPrices,
} from '../api/client';
import type { Jewelry, MetalPrices } from '../types';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const empty: { name: string; metal_type: 'gold' | 'silver'; weight_grams: number } = { name: '', metal_type: 'gold', weight_grams: 0 };

export default function JewelryPage() {
  const [items, setItems] = useState<Jewelry[]>([]);
  const [prices, setPrices] = useState<MetalPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Jewelry | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [jewelryData, priceData] = await Promise.all([getJewelry(), getMetalPrices()]);
      setPrices(priceData);
      setItems(
        jewelryData.map((j) => {
          const ppg = j.metal_type === 'gold' ? priceData.gold : priceData.silver;
          return { ...j, current_price_per_gram: ppg, total_value: j.weight_grams * ppg };
        })
      );
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
        await updateJewelry(editing.id, form);
      } else {
        await createJewelry(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleEdit = (j: Jewelry) => {
    setEditing(j);
    setForm({ name: j.name, metal_type: j.metal_type, weight_grams: j.weight_grams });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this jewelry item?')) return;
    await deleteJewelry(id);
    load();
  };

  const toggleInclude = async (j: Jewelry) => {
    await updateJewelry(j.id, { included_in_zakat: !j.included_in_zakat });
    load();
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Jewelry</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Jewelry
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {prices && (
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Gold: {fmt(prices.gold)}/g</span>
          <span>Silver: {fmt(prices.silver)}/g</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow space-y-4">
          <h2 className="text-lg font-semibold">{editing ? 'Edit Jewelry' : 'New Jewelry'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Metal Type *</label>
              <select value={form.metal_type} onChange={(e) => setForm({ ...form, metal_type: e.target.value as 'gold' | 'silver' })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none">
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (grams) *</label>
              <input required type="number" step="0.01" value={form.weight_grams} onChange={(e) => setForm({ ...form, weight_grams: +e.target.value })}
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Weight (g)</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Price/g</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Total Value</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Include</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No jewelry yet.</td></tr>
            )}
            {items.map((j) => (
              <tr key={j.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{j.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">{j.metal_type}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">{j.weight_grams}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {j.current_price_per_gram != null ? fmt(j.current_price_per_gram) : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {j.total_value != null ? fmt(j.total_value) : '—'}
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => toggleInclude(j)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${j.included_in_zakat ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {j.included_in_zakat ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(j)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(j.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
