import type { ApiClient } from './types';
import type { RetirementAccount, Investment, Savings, Jewelry, Settings, MetalPrices } from '../types';
import { calculateZakat } from '../calculator/zakat';

const KEYS = {
  retirement: 'zakat:retirement',
  investments: 'zakat:investments',
  savings: 'zakat:savings',
  jewelry: 'zakat:jewelry',
  settings: 'zakat:settings',
  nextId: 'zakat:nextId',
  stockPrices: 'zakat:prices:stocks',
  metalPrices: 'zakat:prices:metals',
} as const;

function getItems<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function nextId(): number {
  const current = parseInt(localStorage.getItem(KEYS.nextId) || '0', 10);
  const next = current + 1;
  localStorage.setItem(KEYS.nextId, String(next));
  return next;
}

function now(): string {
  return new Date().toISOString();
}

const defaultSettings: Settings = {
  nisab_method: 'silver',
  default_withdrawal_penalty: 10,
  default_tax_rate: 33,
};

function getStoredPrices(): { stocks: Record<string, number>; metals: MetalPrices } {
  const stocks: Record<string, number> = JSON.parse(localStorage.getItem(KEYS.stockPrices) || '{}');
  const metals: MetalPrices = JSON.parse(localStorage.getItem(KEYS.metalPrices) || '{"gold":0,"silver":0}');
  return { stocks, metals };
}

export function createLocalClient(): ApiClient {
  return {
    // Retirement
    getRetirementAccounts: async () => getItems<RetirementAccount>(KEYS.retirement),
    createRetirementAccount: async (data) => {
      const items = getItems<RetirementAccount>(KEYS.retirement);
      const item: RetirementAccount = {
        id: nextId(), name: data.name || '', balance: data.balance || 0,
        withdrawal_penalty: data.withdrawal_penalty ?? 10, tax_rate: data.tax_rate ?? 33,
        included_in_zakat: data.included_in_zakat ?? true, created_at: now(), updated_at: now(),
      };
      items.push(item);
      setItems(KEYS.retirement, items);
      return item;
    },
    updateRetirementAccount: async (id, data) => {
      const items = getItems<RetirementAccount>(KEYS.retirement);
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('not found');
      items[idx] = { ...items[idx], ...data, id, updated_at: now() };
      setItems(KEYS.retirement, items);
      return items[idx];
    },
    deleteRetirementAccount: async (id) => {
      const items = getItems<RetirementAccount>(KEYS.retirement);
      setItems(KEYS.retirement, items.filter(i => i.id !== id));
    },

    // Investments
    getInvestments: async () => getItems<Investment>(KEYS.investments),
    createInvestment: async (data) => {
      const items = getItems<Investment>(KEYS.investments);
      const item: Investment = {
        id: nextId(), ticker: data.ticker || '', shares: data.shares || 0,
        purchase_date: data.purchase_date || '', included_in_zakat: data.included_in_zakat ?? true,
        created_at: now(), updated_at: now(),
      };
      items.push(item);
      setItems(KEYS.investments, items);
      return item;
    },
    updateInvestment: async (id, data) => {
      const items = getItems<Investment>(KEYS.investments);
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('not found');
      items[idx] = { ...items[idx], ...data, id, updated_at: now() };
      setItems(KEYS.investments, items);
      return items[idx];
    },
    deleteInvestment: async (id) => {
      const items = getItems<Investment>(KEYS.investments);
      setItems(KEYS.investments, items.filter(i => i.id !== id));
    },

    // Savings
    getSavings: async () => getItems<Savings>(KEYS.savings),
    createSavings: async (data) => {
      const items = getItems<Savings>(KEYS.savings);
      const item: Savings = {
        id: nextId(), name: data.name || '', amount: data.amount || 0,
        included_in_zakat: data.included_in_zakat ?? true, created_at: now(), updated_at: now(),
      };
      items.push(item);
      setItems(KEYS.savings, items);
      return item;
    },
    updateSavings: async (id, data) => {
      const items = getItems<Savings>(KEYS.savings);
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('not found');
      items[idx] = { ...items[idx], ...data, id, updated_at: now() };
      setItems(KEYS.savings, items);
      return items[idx];
    },
    deleteSavings: async (id) => {
      const items = getItems<Savings>(KEYS.savings);
      setItems(KEYS.savings, items.filter(i => i.id !== id));
    },

    // Jewelry
    getJewelry: async () => getItems<Jewelry>(KEYS.jewelry),
    createJewelry: async (data) => {
      const items = getItems<Jewelry>(KEYS.jewelry);
      const item: Jewelry = {
        id: nextId(), name: data.name || '', metal_type: (data.metal_type as 'gold' | 'silver') || 'gold',
        weight_grams: data.weight_grams || 0, includes_gems: data.includes_gems || false,
        gem_weight: data.gem_weight || 0, gem_weight_unit: (data.gem_weight_unit as 'grams' | 'carats') || 'carats',
        included_in_zakat: data.included_in_zakat ?? true, created_at: now(), updated_at: now(),
      };
      items.push(item);
      setItems(KEYS.jewelry, items);
      return item;
    },
    updateJewelry: async (id, data) => {
      const items = getItems<Jewelry>(KEYS.jewelry);
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('not found');
      items[idx] = { ...items[idx], ...data, id, updated_at: now() };
      setItems(KEYS.jewelry, items);
      return items[idx];
    },
    deleteJewelry: async (id) => {
      const items = getItems<Jewelry>(KEYS.jewelry);
      setItems(KEYS.jewelry, items.filter(i => i.id !== id));
    },

    // Settings
    getSettings: async () => {
      const raw = localStorage.getItem(KEYS.settings);
      return raw ? JSON.parse(raw) : { ...defaultSettings };
    },
    updateSettings: async (data) => {
      const current = JSON.parse(localStorage.getItem(KEYS.settings) || JSON.stringify(defaultSettings));
      const updated = { ...current, ...data };
      localStorage.setItem(KEYS.settings, JSON.stringify(updated));
      return updated;
    },

    // Zakat calculation (client-side)
    calculateZakat: async () => {
      const retirement = getItems<RetirementAccount>(KEYS.retirement);
      const investments = getItems<Investment>(KEYS.investments);
      const savings = getItems<Savings>(KEYS.savings);
      const jewelry = getItems<Jewelry>(KEYS.jewelry);
      const settings: Settings = JSON.parse(localStorage.getItem(KEYS.settings) || JSON.stringify(defaultSettings));
      const { stocks, metals } = getStoredPrices();
      return calculateZakat(retirement, investments, savings, jewelry, settings, { stocks, metals });
    },

    // Prices — not available in lite mode, return stored user-entered prices
    getStockPrice: async (ticker) => {
      const stocks: Record<string, number> = JSON.parse(localStorage.getItem(KEYS.stockPrices) || '{}');
      const price = stocks[ticker];
      if (price == null) throw new Error(`No price set for ${ticker}. Enter it manually.`);
      return { price };
    },
    getMetalPrices: async () => {
      return JSON.parse(localStorage.getItem(KEYS.metalPrices) || '{"gold":0,"silver":0}');
    },

    // CSV export/import (client-side)
    exportData: async () => {
      const retirement = getItems<RetirementAccount>(KEYS.retirement);
      const investments = getItems<Investment>(KEYS.investments);
      const savings = getItems<Savings>(KEYS.savings);
      const jewelry = getItems<Jewelry>(KEYS.jewelry);
      const settings: Settings = JSON.parse(localStorage.getItem(KEYS.settings) || JSON.stringify(defaultSettings));

      let csv = '[retirement]\nname,balance,withdrawal_penalty,tax_rate,included_in_zakat\n';
      for (const a of retirement) {
        csv += `${a.name},${a.balance},${a.withdrawal_penalty},${a.tax_rate},${a.included_in_zakat}\n`;
      }
      csv += '\n[investments]\nticker,shares,purchase_date,included_in_zakat\n';
      for (const inv of investments) {
        csv += `${inv.ticker},${inv.shares},${inv.purchase_date},${inv.included_in_zakat}\n`;
      }
      csv += '\n[savings]\nname,amount,included_in_zakat\n';
      for (const s of savings) {
        csv += `${s.name},${s.amount},${s.included_in_zakat}\n`;
      }
      csv += '\n[jewelry]\nname,metal_type,weight_grams,includes_gems,gem_weight,gem_weight_unit,included_in_zakat\n';
      for (const j of jewelry) {
        csv += `${j.name},${j.metal_type},${j.weight_grams},${j.includes_gems},${j.gem_weight},${j.gem_weight_unit},${j.included_in_zakat}\n`;
      }
      csv += '\n[settings]\nnisab_method,default_withdrawal_penalty,default_tax_rate\n';
      csv += `${settings.nisab_method},${settings.default_withdrawal_penalty},${settings.default_tax_rate}\n`;
      return csv;
    },
    importData: async (csv) => {
      let currentSection = '';
      let headerSkipped = false;
      const retirement: RetirementAccount[] = [];
      const investments: Investment[] = [];
      const savings: Savings[] = [];
      const jewelry: Jewelry[] = [];
      let settings: Settings = { ...defaultSettings };

      for (const line of csv.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) { headerSkipped = false; continue; }
        const sectionMatch = trimmed.match(/^\[(\w+)\]$/);
        if (sectionMatch) {
          currentSection = sectionMatch[1];
          headerSkipped = false;
          continue;
        }
        if (!headerSkipped) { headerSkipped = true; continue; } // skip column headers
        const cols = trimmed.split(',');

        switch (currentSection) {
          case 'retirement':
            retirement.push({
              id: nextId(), name: cols[0], balance: parseFloat(cols[1]),
              withdrawal_penalty: parseFloat(cols[2]), tax_rate: parseFloat(cols[3]),
              included_in_zakat: cols[4] === 'true', created_at: now(), updated_at: now(),
            });
            break;
          case 'investments':
            investments.push({
              id: nextId(), ticker: cols[0], shares: parseFloat(cols[1]),
              purchase_date: cols[2], included_in_zakat: cols[3] === 'true',
              created_at: now(), updated_at: now(),
            });
            break;
          case 'savings':
            savings.push({
              id: nextId(), name: cols[0], amount: parseFloat(cols[1]),
              included_in_zakat: cols[2] === 'true', created_at: now(), updated_at: now(),
            });
            break;
          case 'jewelry':
            jewelry.push({
              id: nextId(), name: cols[0], metal_type: cols[1] as 'gold' | 'silver',
              weight_grams: parseFloat(cols[2]), includes_gems: cols[3] === 'true',
              gem_weight: parseFloat(cols[4]), gem_weight_unit: cols[5] as 'grams' | 'carats',
              included_in_zakat: cols[6] === 'true', created_at: now(), updated_at: now(),
            });
            break;
          case 'settings':
            settings = {
              nisab_method: cols[0], default_withdrawal_penalty: parseFloat(cols[1]),
              default_tax_rate: parseFloat(cols[2]),
            };
            break;
        }
      }

      setItems(KEYS.retirement, retirement);
      setItems(KEYS.investments, investments);
      setItems(KEYS.savings, savings);
      setItems(KEYS.jewelry, jewelry);
      localStorage.setItem(KEYS.settings, JSON.stringify(settings));
    },
  };
}
