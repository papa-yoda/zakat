import { useEffect, useState } from 'react';
import { getSavings, createSavings, updateSavings, deleteSavings } from '../api/client';
import type { Savings } from '../types';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const empty = { name: '', amount: 0 };

export default function SavingsPage() {
  const [savings, setSavings] = useState<Savings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Savings | null>(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    setLoading(true);
    getSavings()
      .then(setSavings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSavings(editing.id, form);
      } else {
        await createSavings(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleEdit = (s: Savings) => {
    setEditing(s);
    setForm({ name: s.name, amount: s.amount });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this savings entry?')) return;
    await deleteSavings(id);
    load();
  };

  const toggleInclude = async (s: Savings) => {
    await updateSavings(s.id, { included_in_zakat: !s.included_in_zakat });
    load();
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Savings</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Savings
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow space-y-4">
          <h2 className="text-lg font-semibold">{editing ? 'Edit Savings' : 'New Savings'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount *</label>
              <input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })}
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
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Include</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {savings.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No savings yet.</td></tr>
            )}
            {savings.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{s.name}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">{fmt(s.amount)}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => toggleInclude(s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${s.included_in_zakat ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {s.included_in_zakat ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
