import type { ApiClient } from './types';
import type { RetirementAccount, Investment, Savings, Jewelry, Settings, ZakatResult, MetalPrices } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function createHttpClient(): ApiClient {
  return {
    getRetirementAccounts: () => request<RetirementAccount[]>('/retirement'),
    createRetirementAccount: (data) => request<RetirementAccount>('/retirement', { method: 'POST', body: JSON.stringify(data) }),
    updateRetirementAccount: (id, data) => request<RetirementAccount>(`/retirement/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteRetirementAccount: (id) => request<void>(`/retirement/${id}`, { method: 'DELETE' }),

    getInvestments: () => request<Investment[]>('/investments'),
    createInvestment: (data) => request<Investment>('/investments', { method: 'POST', body: JSON.stringify(data) }),
    updateInvestment: (id, data) => request<Investment>(`/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteInvestment: (id) => request<void>(`/investments/${id}`, { method: 'DELETE' }),

    getSavings: () => request<Savings[]>('/savings'),
    createSavings: (data) => request<Savings>('/savings', { method: 'POST', body: JSON.stringify(data) }),
    updateSavings: (id, data) => request<Savings>(`/savings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSavings: (id) => request<void>(`/savings/${id}`, { method: 'DELETE' }),

    getJewelry: () => request<Jewelry[]>('/jewelry'),
    createJewelry: (data) => request<Jewelry>('/jewelry', { method: 'POST', body: JSON.stringify(data) }),
    updateJewelry: (id, data) => request<Jewelry>(`/jewelry/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteJewelry: (id) => request<void>(`/jewelry/${id}`, { method: 'DELETE' }),

    getSettings: () => request<Settings>('/settings'),
    updateSettings: (data) => request<Settings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

    calculateZakat: () => request<ZakatResult>('/zakat/calculate'),

    getStockPrice: (ticker) => request<{ price: number }>(`/prices/stock/${ticker}`),
    getMetalPrices: () => request<MetalPrices>('/prices/metals'),

    exportData: async () => {
      const res = await fetch(`${BASE}/export`);
      if (!res.ok) throw new Error('Export failed');
      return res.text();
    },
    importData: async (csv) => {
      const form = new FormData();
      form.append('file', new Blob([csv], { type: 'text/csv' }), 'zakat-data.csv');
      const res = await fetch(`${BASE}/import`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Import failed');
    },
  };
}
