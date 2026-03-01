package prices

import (
	"fmt"
	"sync"
	"time"
)

// Troy ounce to gram conversion factor
const troyOzToGrams = 31.1035

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

// fetchMetalPrices uses Yahoo Finance commodity futures tickers:
//   GC=F — Gold futures (USD per troy oz)
//   SI=F — Silver futures (USD per troy oz)
func fetchMetalPrices() (*MetalPrices, error) {
	goldOz, err := fetchYahooPrice("GC=F")
	if err != nil {
		return nil, fmt.Errorf("fetch gold price: %w", err)
	}

	silverOz, err := fetchYahooPrice("SI=F")
	if err != nil {
		return nil, fmt.Errorf("fetch silver price: %w", err)
	}

	return &MetalPrices{
		GoldPerGram:   goldOz / troyOzToGrams,
		SilverPerGram: silverOz / troyOzToGrams,
	}, nil
}
