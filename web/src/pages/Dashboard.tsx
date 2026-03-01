import { useEffect, useState } from 'react';
import { calculateZakat } from '../api/client';
import type { ZakatResult } from '../types';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

export default function Dashboard() {
  const [result, setResult] = useState<ZakatResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    calculateZakat()
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!result) return null;

  const { breakdown } = result;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={load}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Total Zakatable Assets</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{fmt(result.total_zakatable_assets)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Nisab Threshold ({result.nisab_method === 'gold' ? '85g gold' : '595g silver'})
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{fmt(result.nisab_value_usd)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Zakat Owed (2.5%)</p>
          <p className={`mt-1 text-3xl font-bold ${result.meets_nisab ? 'text-green-600' : 'text-amber-600'}`}>
            {fmt(result.zakat_owed)}
          </p>
        </div>
      </div>

      {/* Nisab Status */}
      {result.meets_nisab ? (
        <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
          ✓ Meets Nisab — Zakat is owed
        </div>
      ) : (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
          ✗ Below Nisab — No Zakat owed
        </div>
      )}

      {/* Breakdown Table */}
      <div className="rounded-lg bg-white shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Zakatable Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Retirement Accounts</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{fmt(breakdown.retirement.after_penalty_and_tax)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Investments</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{fmt(breakdown.investments.total)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Savings</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{fmt(breakdown.savings.total)}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">Jewelry</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{fmt(breakdown.jewelry.total)}</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 text-sm text-gray-900">Total</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{fmt(result.total_zakatable_assets)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
