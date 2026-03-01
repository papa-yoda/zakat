package prices

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type MetalPrices struct {
	GoldPerGram   float64 `json:"gold_per_gram"`
	SilverPerGram float64 `json:"silver_per_gram"`
}

type metalCache struct {
	mu        sync.RWMutex
	prices    *MetalPrices
	fetchedAt time.Time
	ttl       time.Duration
}

var metals = &metalCache{
	ttl: 1 * time.Hour,
}

func GetMetalPrices() (*MetalPrices, error) {
	metals.mu.RLock()
	if metals.prices != nil && time.Since(metals.fetchedAt) < metals.ttl {
		p := *metals.prices
		metals.mu.RUnlock()
		return &p, nil
	}
	metals.mu.RUnlock()

	prices, err := fetchMetalPrices()
	if err != nil {
		return nil, err
	}

	metals.mu.Lock()
	metals.prices = prices
	metals.fetchedAt = time.Now()
	metals.mu.Unlock()

	return prices, nil
}

func fetchMetalPrices() (*MetalPrices, error) {
	prices, err := fetchMetalsDev()
	if err != nil {
		return nil, fmt.Errorf("metals.dev failed: %w", err)
	}
	return prices, nil
}

func fetchMetalsDev() (*MetalPrices, error) {
	url := "https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=gram"

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("fetch metals: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("metals.dev returned status %d", resp.StatusCode)
	}

	var result struct {
		Metals struct {
			Gold   float64 `json:"gold"`
			Silver float64 `json:"silver"`
		} `json:"metals"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode metals response: %w", err)
	}

	if result.Metals.Gold == 0 && result.Metals.Silver == 0 {
		return nil, fmt.Errorf("metals.dev returned zero prices")
	}

	return &MetalPrices{
		GoldPerGram:   result.Metals.Gold,
		SilverPerGram: result.Metals.Silver,
	}, nil
}
