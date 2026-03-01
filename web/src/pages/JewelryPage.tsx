import { useEffect, useState } from 'react';
import {
  getJewelry,
  createJewelry,
  updateJewelry,
  deleteJewelry,
  getMetalPrices,
} from '../api/client';
import type { Jewelry, MetalPrices } from '../types';
import Toggle from '../components/Toggle';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

type FormState = {
  name: string;
  metal_type: 'gold' | 'silver';
  weight_grams: number;
  includes_gems: boolean;
  gem_weight: number;
  gem_weight_unit: 'grams' | 'carats';
};

const empty: FormState = {
  name: '',
  metal_type: 'gold',
  weight_grams: 0,
  includes_gems: false,
  gem_weight: 0,
  gem_weight_unit: 'carats',
};

function gemWeightInGrams(weight: number, unit: 'grams' | 'carats'): number {
  return unit === 'carats' ? weight * 0.2 : weight;
}

function metalWeight(j: Jewelry): number {
  if (!j.includes_gems || j.gem_weight <= 0) return j.weight_grams;
  const deduction = gemWeightInGrams(j.gem_weight, j.gem_weight_unit);
  return Math.max(0, j.weight_grams - deduction);
}

export default function JewelryPage() {
  const [items, setItems] = useState<Jewelry[]>([]);
  const [prices, setPrices] = useState<MetalPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Jewelry | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [jewelryData, priceData] = await Promise.all([getJewelry(), getMetalPrices()]);
      setPrices(priceData);
      setItems(
        jewelryData.map((j) => {
          const ppg = j.metal_type === 'gold' ? priceData.gold : priceData.silver;
          const mw = metalWeight(j);
          return { ...j, current_price_per_gram: ppg, total_value: mw * ppg, metal_weight_grams: mw };
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
    setForm({
      name: j.name,
      metal_type: j.metal_type,
      weight_grams: j.weight_grams,
      includes_gems: j.includes_gems,
      gem_weight: j.gem_weight,
      gem_weight_unit: j.gem_weight_unit,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this jewelry item?')) return;
    await deleteJewelry(id);
    load();
  };

  const toggleInclude = async (j: Jewelry) => {
    await updateJewelry(j.id, { ...j, included_in_zakat: !j.included_in_zakat });
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
              <label className="block text-sm font-medium text-gray-700">Total Weight (grams) *</label>
              <input required type="number" step="0.01" min="0" value={form.weight_grams}
                onChange={(e) => setForm({ ...form, weight_grams: +e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          {/* Gem section */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Includes Gems</label>
              <Toggle
                checked={form.includes_gems}
                onChange={() => setForm({ ...form, includes_gems: !form.includes_gems })}
              />
            </div>

            {form.includes_gems && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Gem Weight *</label>
                  <input required type="number" step="0.01" min="0" value={form.gem_weight}
                    onChange={(e) => setForm({ ...form, gem_weight: +e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <select value={form.gem_weight_unit}
                    onChange={(e) => setForm({ ...form, gem_weight_unit: e.target.value as 'grams' | 'carats' })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none">
                    <option value="carats">Carats (ct)</option>
                    <option value="grams">Grams (g)</option>
                  </select>
                </div>
                {form.gem_weight > 0 && (
                  <p className="sm:col-span-2 text-xs text-gray-500">
                    Gem deduction: {gemWeightInGrams(form.gem_weight, form.gem_weight_unit).toFixed(3)}g
                    &nbsp;→ Metal weight:{' '}
                    {Math.max(0, form.weight_grams - gemWeightInGrams(form.gem_weight, form.gem_weight_unit)).toFixed(3)}g
                  </p>
                )}
              </div>
            )}
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
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Total Weight</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Metal Weight</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Price/g</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Total Value</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Include</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">No jewelry yet.</td></tr>
            )}
            {items.map((j) => (
              <tr key={j.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>{j.name}</div>
                  {j.includes_gems && j.gem_weight > 0 && (
                    <div className="text-xs text-gray-400">
                      Gems: {j.gem_weight}{j.gem_weight_unit === 'carats' ? ' ct' : ' g'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">{j.metal_type}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">{j.weight_grams}g</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {j.includes_gems && j.gem_weight > 0
                    ? <span className="text-blue-700">{(j.metal_weight_grams ?? metalWeight(j)).toFixed(3)}g</span>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {j.current_price_per_gram != null ? fmt(j.current_price_per_gram) : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {j.total_value != null ? fmt(j.total_value) : '—'}
                </td>
                <td className="px-6 py-4 text-center">
                  <Toggle checked={j.included_in_zakat} onChange={() => toggleInclude(j)} />
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
