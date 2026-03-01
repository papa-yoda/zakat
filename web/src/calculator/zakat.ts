import type { RetirementAccount, Investment, Savings, Jewelry, Settings, ZakatResult } from '../types';

const NISAB_SILVER_GRAMS = 595;
const NISAB_GOLD_GRAMS = 85;

interface PriceData {
  stocks: Record<string, number>; // ticker -> price
  metals: { gold: number; silver: number }; // price per gram
}

export function calculateZakat(
  retirement: RetirementAccount[],
  investments: Investment[],
  savings: Savings[],
  jewelry: Jewelry[],
  settings: Settings,
  prices: PriceData
): ZakatResult {
  const nisabMethod = settings.nisab_method || 'silver';
  let nisabThreshold: number;
  let nisabValueUSD: number;

  if (nisabMethod === 'gold') {
    nisabThreshold = NISAB_GOLD_GRAMS;
    nisabValueUSD = NISAB_GOLD_GRAMS * (prices.metals.gold || 0);
  } else {
    nisabThreshold = NISAB_SILVER_GRAMS;
    nisabValueUSD = NISAB_SILVER_GRAMS * (prices.metals.silver || 0);
  }

  // Retirement
  let retGrossTotal = 0;
  let retAfterPenaltyAndTax = 0;
  const retItems: RetirementAccount[] = [];
  for (const a of retirement) {
    if (!a.included_in_zakat) continue;
    const zakatable = a.balance * (1 - a.withdrawal_penalty / 100) * (1 - a.tax_rate / 100);
    retGrossTotal += a.balance;
    retAfterPenaltyAndTax += zakatable;
    retItems.push({ ...a });
  }

  // Investments
  let invTotal = 0;
  const invItems: Investment[] = [];
  for (const inv of investments) {
    if (!inv.included_in_zakat) continue;
    const currentPrice = prices.stocks[inv.ticker] ?? 0;
    const totalValue = inv.shares * currentPrice;
    const purchaseDate = new Date(inv.purchase_date);
    const isLongTerm = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24) > 365;
    invTotal += totalValue;
    invItems.push({ ...inv, current_price: currentPrice, total_value: totalValue, is_long_term: isLongTerm });
  }

  // Savings
  let savTotal = 0;
  const savItems: Savings[] = [];
  for (const s of savings) {
    if (!s.included_in_zakat) continue;
    savTotal += s.amount;
    savItems.push({ ...s });
  }

  // Jewelry
  let jewTotal = 0;
  const jewItems: Jewelry[] = [];
  for (const j of jewelry) {
    if (!j.included_in_zakat) continue;
    const pricePerGram = j.metal_type === 'gold' ? (prices.metals.gold || 0) : (prices.metals.silver || 0);
    let metalWeightGrams = j.weight_grams;
    if (j.includes_gems && j.gem_weight > 0) {
      const gemGrams = j.gem_weight_unit === 'carats' ? j.gem_weight * 0.2 : j.gem_weight;
      metalWeightGrams = Math.max(0, metalWeightGrams - gemGrams);
    }
    const totalValue = metalWeightGrams * pricePerGram;
    jewTotal += totalValue;
    jewItems.push({ ...j, current_price_per_gram: pricePerGram, total_value: totalValue, metal_weight_grams: metalWeightGrams });
  }

  const totalZakatableAssets = retAfterPenaltyAndTax + invTotal + savTotal + jewTotal;
  const meetsNisab = totalZakatableAssets >= nisabValueUSD;
  const zakatOwed = meetsNisab ? totalZakatableAssets * 0.025 : 0;

  return {
    nisab_method: nisabMethod,
    nisab_threshold: nisabThreshold,
    nisab_value_usd: nisabValueUSD,
    total_zakatable_assets: totalZakatableAssets,
    meets_nisab: meetsNisab,
    zakat_owed: zakatOwed,
    breakdown: {
      retirement: { gross_total: retGrossTotal, after_penalty_and_tax: retAfterPenaltyAndTax, items: retItems },
      investments: { total: invTotal, items: invItems },
      savings: { total: savTotal, items: savItems },
      jewelry: { total: jewTotal, items: jewItems },
    },
  };
}
