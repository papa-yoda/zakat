package store

import "zakat/internal/model"

type Store interface {
	// Retirement
	GetRetirementAccounts() ([]model.RetirementAccount, error)
	CreateRetirementAccount(a *model.RetirementAccount) error
	UpdateRetirementAccount(a *model.RetirementAccount) error
	DeleteRetirementAccount(id int64) error

	// Investments
	GetInvestments() ([]model.Investment, error)
	CreateInvestment(inv *model.Investment) error
	UpdateInvestment(inv *model.Investment) error
	DeleteInvestment(id int64) error

	// Savings
	GetSavings() ([]model.Savings, error)
	CreateSavings(s *model.Savings) error
	UpdateSavings(s *model.Savings) error
	DeleteSavings(id int64) error

	// Jewelry
	GetJewelry() ([]model.Jewelry, error)
	CreateJewelry(j *model.Jewelry) error
	UpdateJewelry(j *model.Jewelry) error
	DeleteJewelry(id int64) error

	// Settings
	GetSettings() (*model.Settings, error)
	UpdateSettings(s *model.Settings) error
}
