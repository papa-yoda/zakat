import { useEffect, useState } from 'react';
import {
  getRetirementAccounts,
  createRetirementAccount,
  updateRetirementAccount,
  deleteRetirementAccount,
} from '../api/client';
import type { RetirementAccount } from '../types';
import Toggle from '../components/Toggle';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

const empty = { name: '', balance: 0, withdrawal_penalty: 10, tax_rate: 33 };

export default function RetirementPage() {
  const [accounts, setAccounts] = useState<RetirementAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RetirementAccount | null>(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    setLoading(true);
    getRetirementAccounts()
      .then(setAccounts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateRetirementAccount(editing.id, form);
      } else {
        await createRetirementAccount(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(empty);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleEdit = (a: RetirementAccount) => {
    setEditing(a);
    setForm({ name: a.name, balance: a.balance, withdrawal_penalty: a.withdrawal_penalty, tax_rate: a.tax_rate });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this account?')) return;
    await deleteRetirementAccount(id);
    load();
  };

  const toggleInclude = async (a: RetirementAccount) => {
    await updateRetirementAccount(a.id, { ...a, included_in_zakat: !a.included_in_zakat });
    load();
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Retirement Accounts</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Account
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow space-y-4">
          <h2 className="text-lg font-semibold">{editing ? 'Edit Account' : 'New Account'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Balance *</label>
              <input required type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: +e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Withdrawal Penalty %</label>
              <input type="number" step="0.1" value={form.withdrawal_penalty} onChange={(e) => setForm({ ...form, withdrawal_penalty: +e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax Rate %</label>
              <input type="number" step="0.1" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: +e.target.value })}
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
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Balance</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Penalty %</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Tax %</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">After Deductions</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Include</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No retirement accounts yet.</td></tr>
            )}
            {accounts.map((a) => {
              const afterDeductions = a.balance * (1 - a.withdrawal_penalty / 100) * (1 - a.tax_rate / 100);
              return (
                <tr key={a.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.name}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{fmt(a.balance)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{a.withdrawal_penalty}%</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{a.tax_rate}%</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">{fmt(afterDeductions)}</td>
                  <td className="px-6 py-4 text-center">
                    <Toggle checked={a.included_in_zakat} onChange={() => toggleInclude(a)} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
