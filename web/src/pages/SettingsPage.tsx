import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api/client';
import type { Settings } from '../types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSuccess('Settings saved successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!settings) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow space-y-4 max-w-lg">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Nisab Method</label>
          <input disabled value={settings.nisab_method}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500" />
          <p className="mt-1 text-xs text-gray-400">Currently only silver (595g) is supported.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Default Withdrawal Penalty %</label>
          <input type="number" step="0.1" value={settings.default_withdrawal_penalty}
            onChange={(e) => setSettings({ ...settings, default_withdrawal_penalty: +e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Default Tax Rate %</label>
          <input type="number" step="0.1" value={settings.default_tax_rate}
            onChange={(e) => setSettings({ ...settings, default_tax_rate: +e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none" />
        </div>

        <button type="submit" disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
