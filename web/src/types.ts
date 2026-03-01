export interface RetirementAccount {
  id: number;
  name: string;
  balance: number;
  withdrawal_penalty: number;
  tax_rate: number;
  included_in_zakat: boolean;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: number;
  ticker: string;
  shares: number;
  purchase_date: string;
  purchase_price?: number;
  included_in_zakat: boolean;
  created_at: string;
  updated_at: string;
  current_price?: number;
  total_value?: number;
  is_long_term?: boolean;
}

export interface Savings {
  id: number;
  name: string;
  amount: number;
  included_in_zakat: boolean;
  created_at: string;
  updated_at: string;
}

export interface Jewelry {
  id: number;
  name: string;
  metal_type: 'gold' | 'silver';
  weight_grams: number;
  included_in_zakat: boolean;
  created_at: string;
  updated_at: string;
  current_price_per_gram?: number;
  total_value?: number;
}

export interface Settings {
  nisab_method: string;
  default_withdrawal_penalty: number;
  default_tax_rate: number;
}

export interface ZakatResult {
  nisab_threshold: number;
  nisab_value_usd: number;
  total_zakatable_assets: number;
  meets_nisab: boolean;
  zakat_owed: number;
  breakdown: {
    retirement: { gross_total: number; after_penalty_and_tax: number; items: RetirementAccount[] };
    investments: { total: number; items: Investment[] };
    savings: { total: number; items: Savings[] };
    jewelry: { total: number; items: Jewelry[] };
  };
}

export interface MetalPrices {
  gold: number;
  silver: number;
}
