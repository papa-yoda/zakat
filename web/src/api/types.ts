import type { RetirementAccount, Investment, Savings, Jewelry, Settings, ZakatResult, MetalPrices } from '../types';

export interface ApiClient {
  // Retirement
  getRetirementAccounts(): Promise<RetirementAccount[]>;
  createRetirementAccount(data: Partial<RetirementAccount>): Promise<RetirementAccount>;
  updateRetirementAccount(id: number, data: Partial<RetirementAccount>): Promise<RetirementAccount>;
  deleteRetirementAccount(id: number): Promise<void>;

  // Investments
  getInvestments(): Promise<Investment[]>;
  createInvestment(data: Partial<Investment>): Promise<Investment>;
  updateInvestment(id: number, data: Partial<Investment>): Promise<Investment>;
  deleteInvestment(id: number): Promise<void>;

  // Savings
  getSavings(): Promise<Savings[]>;
  createSavings(data: Partial<Savings>): Promise<Savings>;
  updateSavings(id: number, data: Partial<Savings>): Promise<Savings>;
  deleteSavings(id: number): Promise<void>;

  // Jewelry
  getJewelry(): Promise<Jewelry[]>;
  createJewelry(data: Partial<Jewelry>): Promise<Jewelry>;
  updateJewelry(id: number, data: Partial<Jewelry>): Promise<Jewelry>;
  deleteJewelry(id: number): Promise<void>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(data: Partial<Settings>): Promise<Settings>;

  // Zakat
  calculateZakat(): Promise<ZakatResult>;

  // Prices
  getStockPrice(ticker: string): Promise<{ price: number }>;
  getMetalPrices(): Promise<MetalPrices>;

  // Data import/export
  exportData(): Promise<string>;
  importData(csv: string): Promise<void>;
}
