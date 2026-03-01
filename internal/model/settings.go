package model

type Settings struct {
	NisabMethod              string  `json:"nisab_method"`
	DefaultWithdrawalPenalty float64 `json:"default_withdrawal_penalty"`
	DefaultTaxRate           float64 `json:"default_tax_rate"`
}
