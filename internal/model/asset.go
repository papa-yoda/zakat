package model

type RetirementAccount struct {
	ID                int64   `json:"id"`
	Name              string  `json:"name"`
	Balance           float64 `json:"balance"`
	WithdrawalPenalty float64 `json:"withdrawal_penalty"`
	TaxRate           float64 `json:"tax_rate"`
	IncludedInZakat   bool    `json:"included_in_zakat"`
	CreatedAt         string  `json:"created_at"`
	UpdatedAt         string  `json:"updated_at"`
}

type Investment struct {
	ID              int64   `json:"id"`
	Ticker          string  `json:"ticker"`
	Shares          float64 `json:"shares"`
	PurchaseDate    string  `json:"purchase_date"`
	PurchasePrice   float64 `json:"purchase_price,omitempty"`
	IncludedInZakat bool    `json:"included_in_zakat"`
	CreatedAt       string  `json:"created_at"`
	UpdatedAt       string  `json:"updated_at"`
	// Computed
	CurrentPrice *float64 `json:"current_price,omitempty"`
	TotalValue   *float64 `json:"total_value,omitempty"`
	IsLongTerm   *bool    `json:"is_long_term,omitempty"`
}

type Savings struct {
	ID              int64   `json:"id"`
	Name            string  `json:"name"`
	Amount          float64 `json:"amount"`
	IncludedInZakat bool    `json:"included_in_zakat"`
	CreatedAt       string  `json:"created_at"`
	UpdatedAt       string  `json:"updated_at"`
}

type Jewelry struct {
	ID              int64   `json:"id"`
	Name            string  `json:"name"`
	MetalType       string  `json:"metal_type"`
	WeightGrams     float64 `json:"weight_grams"`
	IncludedInZakat bool    `json:"included_in_zakat"`
	CreatedAt       string  `json:"created_at"`
	UpdatedAt       string  `json:"updated_at"`
	// Computed
	CurrentPricePerGram *float64 `json:"current_price_per_gram,omitempty"`
	TotalValue          *float64 `json:"total_value,omitempty"`
}
