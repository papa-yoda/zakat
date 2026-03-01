package store

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"

	"zakat/internal/model"
)

// JSONStore implements Store using a JSON file for persistence.
// This avoids CGO dependency from SQLite drivers.
type JSONStore struct {
	mu   sync.RWMutex
	path string
	data *storeData
}

type storeData struct {
	RetirementAccounts []model.RetirementAccount `json:"retirement_accounts"`
	Investments        []model.Investment        `json:"investments"`
	Savings            []model.Savings           `json:"savings"`
	Jewelry            []model.Jewelry           `json:"jewelry"`
	Settings           model.Settings            `json:"settings"`
	NextID             int64                     `json:"next_id"`
}

func NewSQLiteStore(dbPath string) (*JSONStore, error) {
	jsonPath := dbPath + ".json"

	s := &JSONStore{
		path: jsonPath,
		data: &storeData{
			RetirementAccounts: []model.RetirementAccount{},
			Investments:        []model.Investment{},
			Savings:            []model.Savings{},
			Jewelry:            []model.Jewelry{},
			Settings: model.Settings{
				NisabMethod:              "silver",
				DefaultWithdrawalPenalty: 10.0,
				DefaultTaxRate:           33.0,
			},
			NextID: 1,
		},
	}

	// Load existing data if file exists
	if data, err := os.ReadFile(jsonPath); err == nil {
		if err := json.Unmarshal(data, s.data); err != nil {
			return nil, fmt.Errorf("parse store data: %w", err)
		}
	}

	return s, nil
}

func (s *JSONStore) save() error {
	data, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.path, data, 0644)
}

func (s *JSONStore) nextID() int64 {
	id := s.data.NextID
	s.data.NextID++
	return id
}

func now() string {
	return time.Now().UTC().Format(time.RFC3339)
}

// --- Retirement Accounts ---

func (s *JSONStore) GetRetirementAccounts() ([]model.RetirementAccount, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]model.RetirementAccount, len(s.data.RetirementAccounts))
	copy(result, s.data.RetirementAccounts)
	return result, nil
}

func (s *JSONStore) CreateRetirementAccount(a *model.RetirementAccount) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	t := now()
	a.ID = s.nextID()
	a.CreatedAt = t
	a.UpdatedAt = t
	s.data.RetirementAccounts = append(s.data.RetirementAccounts, *a)
	return s.save()
}

func (s *JSONStore) UpdateRetirementAccount(a *model.RetirementAccount) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, existing := range s.data.RetirementAccounts {
		if existing.ID == a.ID {
			a.CreatedAt = existing.CreatedAt
			a.UpdatedAt = now()
			s.data.RetirementAccounts[i] = *a
			return s.save()
		}
	}
	return fmt.Errorf("not found")
}

func (s *JSONStore) DeleteRetirementAccount(id int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, a := range s.data.RetirementAccounts {
		if a.ID == id {
			s.data.RetirementAccounts = append(s.data.RetirementAccounts[:i], s.data.RetirementAccounts[i+1:]...)
			return s.save()
		}
	}
	return fmt.Errorf("not found")
}

// --- Investments ---

func (s *JSONStore) GetInvestments() ([]model.Investment, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]model.Investment, len(s.data.Investments))
	copy(result, s.data.Investments)
	return result, nil
}

func (s *JSONStore) CreateInvestment(inv *model.Investment) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	t := now()
	inv.ID = s.nextID()
	inv.CreatedAt = t
	inv.UpdatedAt = t
	s.data.Investments = append(s.data.Investments, *inv)
	return s.save()
}

func (s *JSONStore) UpdateInvestment(inv *model.Investment) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, existing := range s.data.Investments {
		if existing.ID == inv.ID {
			inv.CreatedAt = existing.CreatedAt
			inv.UpdatedAt = now()
			s.data.Investments[i] = *inv
			return s.save()
		}
	}
	return fmt.Errorf("not found")
}

func (s *JSONStore) DeleteInvestment(id int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, inv := range s.data.Investments {
		if inv.ID == id {
			s.data.Investments = append(s.data.Investments[:i], s.data.Investments[i+1:]...)
			return s.save()
		}
	}
	return fmt.Errorf("not found")
}

// --- Savings ---

func (s *JSONStore) GetSavings() ([]model.Savings, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]model.Savings, len(s.data.Savings))
	copy(result, s.data.Savings)
	return result, nil
}

func (s *JSONStore) CreateSavings(sa *model.Savings) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	t := now()
	sa.ID = s.nextID()
	sa.CreatedAt = t
	sa.UpdatedAt = t
	s.data.Savings = append(s.data.Savings, *sa)
	return s.save()
}

func (s *JSONStore) UpdateSavings(sa *model.Savings) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, existing := range s.data.Savings {
		if existing.ID == sa.ID {
			sa.CreatedAt = existing.CreatedAt
			sa.UpdatedAt = now()
			s.data.Savings[i] = *sa
			return s.save()
		}
	}
	return fmt.Errorf("not found")
}

func (s *JSONStore) DeleteSavings(id int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, sa := range s.data.Savings {
		if sa.ID == id {
			s.data.Savings = append(s.data.Savings[:i], s.data.Savings[i+1:]...)
			return s.save()
		}
	}
	return fmt.Errorf("not found")
}

// --- Jewelry ---

func (s *JSONStore) GetJewelry() ([]model.Jewelry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]model.Jewelry, len(s.data.Jewelry))
	copy(result, s.data.Jewelry)
	return result, nil
}

func (s *JSONStore) CreateJewelry(j *model.Jewelry) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	t := now()
	j.ID = s.nextID()
	j.CreatedAt = t
	j.UpdatedAt = t
	s.data.Jewelry = append(s.data.Jewelry, *j)
	return s.save()
}

func (s *JSONStore) UpdateJewelry(j *model.Jewelry) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, existing := range s.data.Jewelry {
		if existing.ID == j.ID {
			j.CreatedAt = existing.CreatedAt
			j.UpdatedAt = now()
			s.data.Jewelry[i] = *j
			return s.save()
		}
	}
	return fmt.Errorf("not found")
}

func (s *JSONStore) DeleteJewelry(id int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, j := range s.data.Jewelry {
		if j.ID == id {
			s.data.Jewelry = append(s.data.Jewelry[:i], s.data.Jewelry[i+1:]...)
			return s.save()
		}
	}
	return fmt.Errorf("not found")
}

// --- Settings ---

func (s *JSONStore) GetSettings() (*model.Settings, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	settings := s.data.Settings
	return &settings, nil
}

func (s *JSONStore) UpdateSettings(settings *model.Settings) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data.Settings = *settings
	return s.save()
}
