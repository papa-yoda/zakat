package calculator

import (
	"time"

	"zakat/internal/model"
	"zakat/internal/prices"
	"zakat/internal/store"
)

type ZakatResult struct {
	NisabMethod          string         `json:"nisab_method"`
	NisabThreshold       float64        `json:"nisab_threshold"`
	NisabValueUSD        float64        `json:"nisab_value_usd"`
	TotalZakatableAssets float64        `json:"total_zakatable_assets"`
	MeetsNisab           bool           `json:"meets_nisab"`
	ZakatOwed            float64        `json:"zakat_owed"`
	Breakdown            ZakatBreakdown `json:"breakdown"`
}

type ZakatBreakdown struct {
	Retirement  RetirementBreakdown  `json:"retirement"`
	Investments InvestmentBreakdown  `json:"investments"`
	Savings     SavingsBreakdown     `json:"savings"`
	Jewelry     JewelryBreakdown     `json:"jewelry"`
}

type RetirementBreakdown struct {
	GrossTotal          float64                `json:"gross_total"`
	AfterPenaltyAndTax  float64                `json:"after_penalty_and_tax"`
	Items               []RetirementItemDetail `json:"items"`
}

type RetirementItemDetail struct {
	model.RetirementAccount
	ZakatableValue float64 `json:"zakatable_value"`
}

type InvestmentBreakdown struct {
	Total float64                 `json:"total"`
	Items []InvestmentItemDetail  `json:"items"`
}

type InvestmentItemDetail struct {
	model.Investment
	ZakatableValue float64 `json:"zakatable_value"`
}

type SavingsBreakdown struct {
	Total float64              `json:"total"`
	Items []SavingsItemDetail  `json:"items"`
}

type SavingsItemDetail struct {
	model.Savings
	ZakatableValue float64 `json:"zakatable_value"`
}

type JewelryBreakdown struct {
	Total float64              `json:"total"`
	Items []JewelryItemDetail  `json:"items"`
}

type JewelryItemDetail struct {
	model.Jewelry
	ZakatableValue float64 `json:"zakatable_value"`
}

const nisabSilverGrams = 595.0
const nisabGoldGrams = 85.0

func Calculate(s store.Store) (*ZakatResult, error) {
	settings, err := s.GetSettings()
	if err != nil {
		return nil, err
	}

	// Get metal prices for nisab and jewelry
	metalPrices, err := prices.GetMetalPrices()
	if err != nil {
		return nil, err
	}

	var nisabGrams, nisabValueUSD float64
	nisabMethod := settings.NisabMethod
	if nisabMethod == "gold" {
		nisabGrams = nisabGoldGrams
		nisabValueUSD = nisabGoldGrams * metalPrices.GoldPerGram
	} else {
		nisabMethod = "silver"
		nisabGrams = nisabSilverGrams
		nisabValueUSD = nisabSilverGrams * metalPrices.SilverPerGram
	}

	result := &ZakatResult{
		NisabMethod:    nisabMethod,
		NisabThreshold: nisabGrams,
		NisabValueUSD:  nisabValueUSD,
	}

	// Calculate retirement
	retirementAccounts, err := s.GetRetirementAccounts()
	if err != nil {
		return nil, err
	}
	result.Breakdown.Retirement.Items = []RetirementItemDetail{}
	for _, a := range retirementAccounts {
		if !a.IncludedInZakat {
			continue
		}
		zakatable := a.Balance * (1 - a.WithdrawalPenalty/100) * (1 - a.TaxRate/100)
		result.Breakdown.Retirement.GrossTotal += a.Balance
		result.Breakdown.Retirement.AfterPenaltyAndTax += zakatable
		result.Breakdown.Retirement.Items = append(result.Breakdown.Retirement.Items, RetirementItemDetail{
			RetirementAccount: a,
			ZakatableValue:    zakatable,
		})
	}

	// Calculate investments
	investments, err := s.GetInvestments()
	if err != nil {
		return nil, err
	}
	result.Breakdown.Investments.Items = []InvestmentItemDetail{}
	for _, inv := range investments {
		if !inv.IncludedInZakat {
			continue
		}
		currentPrice, err := prices.GetStockPrice(inv.Ticker)
		if err != nil {
			currentPrice = 0
		}
		totalValue := inv.Shares * currentPrice
		inv.CurrentPrice = &currentPrice
		inv.TotalValue = &totalValue

		purchaseDate, _ := time.Parse("2006-01-02", inv.PurchaseDate)
		isLongTerm := time.Since(purchaseDate).Hours() > 365*24
		inv.IsLongTerm = &isLongTerm

		result.Breakdown.Investments.Total += totalValue
		result.Breakdown.Investments.Items = append(result.Breakdown.Investments.Items, InvestmentItemDetail{
			Investment:     inv,
			ZakatableValue: totalValue,
		})
	}

	// Calculate savings
	savings, err := s.GetSavings()
	if err != nil {
		return nil, err
	}
	result.Breakdown.Savings.Items = []SavingsItemDetail{}
	for _, sa := range savings {
		if !sa.IncludedInZakat {
			continue
		}
		result.Breakdown.Savings.Total += sa.Amount
		result.Breakdown.Savings.Items = append(result.Breakdown.Savings.Items, SavingsItemDetail{
			Savings:        sa,
			ZakatableValue: sa.Amount,
		})
	}

	// Calculate jewelry
	jewelry, err := s.GetJewelry()
	if err != nil {
		return nil, err
	}
	result.Breakdown.Jewelry.Items = []JewelryItemDetail{}
	for _, j := range jewelry {
		if !j.IncludedInZakat {
			continue
		}
		var pricePerGram float64
		switch j.MetalType {
		case "gold":
			pricePerGram = metalPrices.GoldPerGram
		case "silver":
			pricePerGram = metalPrices.SilverPerGram
		}

		// Deduct gem weight from total weight to get metal-only weight
		metalWeight := j.WeightGrams
		if j.IncludesGems && j.GemWeight > 0 {
			gemGrams := j.GemWeight
			if j.GemWeightUnit == "carats" {
				gemGrams = j.GemWeight * 0.2 // 1 carat = 0.2 grams
			}
			metalWeight -= gemGrams
			if metalWeight < 0 {
				metalWeight = 0
			}
		}

		totalValue := metalWeight * pricePerGram
		j.CurrentPricePerGram = &pricePerGram
		j.TotalValue = &totalValue
		j.MetalWeightGrams = &metalWeight

		result.Breakdown.Jewelry.Total += totalValue
		result.Breakdown.Jewelry.Items = append(result.Breakdown.Jewelry.Items, JewelryItemDetail{
			Jewelry:        j,
			ZakatableValue: totalValue,
		})
	}

	// Total and nisab check
	result.TotalZakatableAssets = result.Breakdown.Retirement.AfterPenaltyAndTax +
		result.Breakdown.Investments.Total +
		result.Breakdown.Savings.Total +
		result.Breakdown.Jewelry.Total

	result.MeetsNisab = result.TotalZakatableAssets >= result.NisabValueUSD
	if result.MeetsNisab {
		result.ZakatOwed = result.TotalZakatableAssets * 0.025
	}

	return result, nil
}
