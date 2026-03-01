import { useState, useRef } from 'react';
import { exportData, importData } from '../api/client';

export default function DataToolbar() {
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const csv = await exportData();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zakat-data.csv';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Exported!');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Export failed');
    }
    setTimeout(() => setStatus(''), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const csv = await file.text();
      await importData(csv);
      setStatus('Imported! Refresh the page to see changes.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Import failed');
    }
    if (fileRef.current) fileRef.current.value = '';
    setTimeout(() => setStatus(''), 5000);
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4 px-3 space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase">Data</p>
      <button
        onClick={handleExport}
        className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        Export CSV
      </button>
      <label className="block w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer">
        Import CSV
        <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
      </label>
      {status && <p className="text-xs text-gray-500 px-3">{status}</p>}
    </div>
  );
}
