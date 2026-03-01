package prices

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

type stockCache struct {
	mu      sync.RWMutex
	prices  map[string]cachedPrice
	ttl     time.Duration
}

type cachedPrice struct {
	price     float64
	fetchedAt time.Time
}

var stocks = &stockCache{
	prices: make(map[string]cachedPrice),
	ttl:    15 * time.Minute,
}

func GetStockPrice(ticker string) (float64, error) {
	ticker = strings.ToUpper(ticker)

	stocks.mu.RLock()
	if cached, ok := stocks.prices[ticker]; ok && time.Since(cached.fetchedAt) < stocks.ttl {
		stocks.mu.RUnlock()
		return cached.price, nil
	}
	stocks.mu.RUnlock()

	price, err := fetchYahooPrice(ticker)
	if err != nil {
		return 0, err
	}

	stocks.mu.Lock()
	stocks.prices[ticker] = cachedPrice{price: price, fetchedAt: time.Now()}
	stocks.mu.Unlock()

	return price, nil
}

func fetchYahooPrice(ticker string) (float64, error) {
	url := fmt.Sprintf("https://query1.finance.yahoo.com/v8/finance/chart/%s?range=1d&interval=1d", ticker)

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return 0, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; ZakatCalculator/1.0)")
	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("fetch stock price: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("yahoo finance returned status %d for %s", resp.StatusCode, ticker)
	}

	var result struct {
		Chart struct {
			Result []struct {
				Meta struct {
					RegularMarketPrice float64 `json:"regularMarketPrice"`
				} `json:"meta"`
			} `json:"result"`
			Error *struct {
				Code        string `json:"code"`
				Description string `json:"description"`
			} `json:"error"`
		} `json:"chart"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, fmt.Errorf("decode yahoo response: %w", err)
	}

	if result.Chart.Error != nil {
		return 0, fmt.Errorf("yahoo finance error: %s", result.Chart.Error.Description)
	}

	if len(result.Chart.Result) == 0 {
		return 0, fmt.Errorf("no results for ticker %s", ticker)
	}

	return result.Chart.Result[0].Meta.RegularMarketPrice, nil
}
