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

// Retirement Accounts
export const getRetirementAccounts = () => request<RetirementAccount[]>('/retirement');
export const createRetirementAccount = (data: Partial<RetirementAccount>) =>
  request<RetirementAccount>('/retirement', { method: 'POST', body: JSON.stringify(data) });
export const updateRetirementAccount = (id: number, data: Partial<RetirementAccount>) =>
  request<RetirementAccount>(`/retirement/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRetirementAccount = (id: number) =>
  request<void>(`/retirement/${id}`, { method: 'DELETE' });

// Investments
export const getInvestments = () => request<Investment[]>('/investments');
export const createInvestment = (data: Partial<Investment>) =>
  request<Investment>('/investments', { method: 'POST', body: JSON.stringify(data) });
export const updateInvestment = (id: number, data: Partial<Investment>) =>
  request<Investment>(`/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteInvestment = (id: number) =>
  request<void>(`/investments/${id}`, { method: 'DELETE' });

// Savings
export const getSavings = () => request<Savings[]>('/savings');
export const createSavings = (data: Partial<Savings>) =>
  request<Savings>('/savings', { method: 'POST', body: JSON.stringify(data) });
export const updateSavings = (id: number, data: Partial<Savings>) =>
  request<Savings>(`/savings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSavings = (id: number) =>
  request<void>(`/savings/${id}`, { method: 'DELETE' });

// Jewelry
export const getJewelry = () => request<Jewelry[]>('/jewelry');
export const createJewelry = (data: Partial<Jewelry>) =>
  request<Jewelry>('/jewelry', { method: 'POST', body: JSON.stringify(data) });
export const updateJewelry = (id: number, data: Partial<Jewelry>) =>
  request<Jewelry>(`/jewelry/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteJewelry = (id: number) =>
  request<void>(`/jewelry/${id}`, { method: 'DELETE' });

// Settings
export const getSettings = () => request<Settings>('/settings');
export const updateSettings = (data: Partial<Settings>) =>
  request<Settings>('/settings', { method: 'PUT', body: JSON.stringify(data) });

// Zakat
export const calculateZakat = () => request<ZakatResult>('/zakat/calculate');

// Prices
export const getStockPrice = (ticker: string) =>
  request<{ price: number }>(`/prices/stock/${ticker}`);
export const getMetalPrices = () => request<MetalPrices>('/prices/metals');
