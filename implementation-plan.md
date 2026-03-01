# Zakat Calculator - Implementation Plan

## Overview

A single-user, locally-hosted web application for calculating Zakat owed across multiple asset categories. Built with a Go backend (REST API) and React frontend, using SQLite for persistent storage.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Go (net/http + chi router)        |
| Database   | SQLite (via mattn/go-sqlite3)     |
| Frontend   | React (Vite + TypeScript)         |
| UI Library | Tailwind CSS                      |
| Stock API  | Yahoo Finance (via yfinance-style scraping or free endpoint) |
| Metals API | GoldAPI.io free tier or metals.dev free tier |
| Deployment | Single binary (Go embeds frontend static files) |

---

## Project Structure

```
zakat/
├── main.go                    # Entry point, server setup
├── go.mod / go.sum
├── internal/
│   ├── server/
│   │   └── server.go          # HTTP server, middleware, route registration
│   ├── handler/
│   │   ├── assets.go          # CRUD handlers for all asset types
│   │   ├── zakat.go           # Zakat calculation endpoint
│   │   ├── prices.go          # Price-fetching endpoints (stocks, metals)
│   │   └── settings.go        # App settings handler
│   ├── model/
│   │   ├── asset.go           # Asset structs (retirement, investment, savings, jewelry)
│   │   └── settings.go        # Settings struct
│   ├── store/
│   │   ├── store.go           # Store interface
│   │   ├── sqlite.go          # SQLite implementation
│   │   └── migrations.go      # Schema migrations
│   ├── calculator/
│   │   └── zakat.go           # Zakat calculation logic
│   └── prices/
│       ├── stocks.go          # Stock price fetcher (Yahoo Finance)
│       └── metals.go          # Gold/silver price fetcher
├── web/                       # React frontend (Vite project)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Dashboard.tsx          # Main zakat summary view
│   │   │   ├── AssetList.tsx          # Generic asset list with include/exclude toggles
│   │   │   ├── RetirementForm.tsx     # Retirement account form
│   │   │   ├── InvestmentForm.tsx     # Investment (stocks) form
│   │   │   ├── SavingsForm.tsx        # Savings form
│   │   │   ├── JewelryForm.tsx        # Gold/silver jewelry form
│   │   │   └── Settings.tsx           # Settings page
│   │   ├── api/
│   │   │   └── client.ts             # API client
│   │   └── types.ts                   # TypeScript types
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── data/                      # SQLite database file (created at runtime)
    └── zakat.db
```

---

## Database Schema

### `retirement_accounts`
| Column               | Type    | Notes                                  |
|----------------------|---------|----------------------------------------|
| id                   | INTEGER | Primary key, auto-increment            |
| name                 | TEXT    | Account name (e.g., "401k", "IRA")     |
| balance              | REAL    | Current balance in USD                  |
| withdrawal_penalty   | REAL    | Default 10.0 (%)                       |
| tax_rate             | REAL    | Default 33.0 (%)                       |
| included_in_zakat    | BOOLEAN | Default true                           |
| created_at           | TEXT    | ISO 8601 timestamp                     |
| updated_at           | TEXT    | ISO 8601 timestamp                     |

### `investments`
| Column               | Type    | Notes                                  |
|----------------------|---------|----------------------------------------|
| id                   | INTEGER | Primary key, auto-increment            |
| ticker               | TEXT    | Stock ticker symbol                    |
| shares               | REAL    | Number of shares                       |
| purchase_date        | TEXT    | Date of purchase (YYYY-MM-DD)          |
| purchase_price       | REAL    | Price per share at purchase (optional, for reference) |
| included_in_zakat    | BOOLEAN | Default true                           |
| created_at           | TEXT    | ISO 8601 timestamp                     |
| updated_at           | TEXT    | ISO 8601 timestamp                     |

Computed fields (not stored): current_price, total_value, is_long_term (purchase_date > 1 year ago)

### `savings`
| Column               | Type    | Notes                                  |
|----------------------|---------|----------------------------------------|
| id                   | INTEGER | Primary key, auto-increment            |
| name                 | TEXT    | Account name (e.g., "Emergency Fund")  |
| amount               | REAL    | Flat dollar amount                     |
| included_in_zakat    | BOOLEAN | Default true                           |
| created_at           | TEXT    | ISO 8601 timestamp                     |
| updated_at           | TEXT    | ISO 8601 timestamp                     |

### `jewelry`
| Column               | Type    | Notes                                  |
|----------------------|---------|----------------------------------------|
| id                   | INTEGER | Primary key, auto-increment            |
| name                 | TEXT    | Description (e.g., "Wedding Ring")     |
| metal_type           | TEXT    | "gold" or "silver"                     |
| weight_grams         | REAL    | Weight in grams                        |
| included_in_zakat    | BOOLEAN | Default true                           |
| created_at           | TEXT    | ISO 8601 timestamp                     |
| updated_at           | TEXT    | ISO 8601 timestamp                     |

Computed fields (not stored): current_price_per_gram, total_value

### `settings`
| Column | Type    | Notes                                          |
|--------|---------|------------------------------------------------|
| key    | TEXT    | Primary key (e.g., "nisab_method")             |
| value  | TEXT    | JSON-encoded value                             |

Default settings:
- `nisab_method`: `"silver"` (595g of silver)
- `default_withdrawal_penalty`: `10.0`
- `default_tax_rate`: `33.0`

---

## API Endpoints

### Assets CRUD

| Method | Path                          | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/retirement`             | List all retirement accounts         |
| POST   | `/api/retirement`             | Create retirement account            |
| PUT    | `/api/retirement/{id}`        | Update retirement account            |
| DELETE | `/api/retirement/{id}`        | Delete retirement account            |
| GET    | `/api/investments`            | List all investments                 |
| POST   | `/api/investments`            | Create investment                    |
| PUT    | `/api/investments/{id}`       | Update investment                    |
| DELETE | `/api/investments/{id}`       | Delete investment                    |
| GET    | `/api/savings`                | List all savings accounts            |
| POST   | `/api/savings`                | Create savings entry                 |
| PUT    | `/api/savings/{id}`           | Update savings entry                 |
| DELETE | `/api/savings/{id}`           | Delete savings entry                 |
| GET    | `/api/jewelry`                | List all jewelry items               |
| POST   | `/api/jewelry`                | Create jewelry item                  |
| PUT    | `/api/jewelry/{id}`           | Update jewelry item                  |
| DELETE | `/api/jewelry/{id}`           | Delete jewelry item                  |

### Prices

| Method | Path                          | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/prices/stock/{ticker}`  | Get current stock price              |
| GET    | `/api/prices/metals`          | Get current gold & silver prices/gram|

### Zakat Calculation

| Method | Path                          | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/zakat/calculate`        | Calculate zakat across all included assets |

Response shape:
```json
{
  "nisab_threshold": 595.00,
  "nisab_value_usd": 487.50,
  "total_zakatable_assets": 125000.00,
  "meets_nisab": true,
  "zakat_owed": 3125.00,
  "breakdown": {
    "retirement": {
      "gross_total": 50000.00,
      "after_penalty_and_tax": 28500.00,
      "items": [...]
    },
    "investments": {
      "total": 40000.00,
      "items": [...]
    },
    "savings": {
      "total": 30000.00,
      "items": [...]
    },
    "jewelry": {
      "total": 26500.00,
      "items": [...]
    }
  }
}
```

### Settings

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/settings`       | Get all settings         |
| PUT    | `/api/settings`       | Update settings          |

---

## Zakat Calculation Logic

### Per-Asset-Type Zakatable Value

1. **Retirement accounts** (only if `included_in_zakat` = true):
   - `zakatable = balance * (1 - withdrawal_penalty/100) * (1 - tax_rate/100)`
   - With defaults: `balance * 0.90 * 0.67 = balance * 0.603`

2. **Investments** (only if `included_in_zakat` = true):
   - Fetch current price for ticker
   - `total_value = shares * current_price`
   - Classification: if `today - purchase_date > 365 days` → long-term, else short-term
   - Both long-term and short-term are zakatable at full current market value

3. **Savings** (only if `included_in_zakat` = true):
   - `zakatable = amount` (flat value as entered)

4. **Jewelry** (only if `included_in_zakat` = true):
   - Fetch current price per gram for gold/silver
   - `zakatable = weight_grams * price_per_gram`

### Nisab Check
- **Silver-based** (default): Nisab = current market value of 595g of silver
- Fetch current silver price per gram, multiply by 595
- If `total_zakatable_assets >= nisab_value` → zakat is owed

### Zakat Calculation
- `zakat_owed = total_zakatable_assets * 0.025` (fixed 2.5%)
- If total assets < nisab → `zakat_owed = 0`

---

## Implementation Phases

### Phase 1: Backend Foundation
1. Initialize Go module, install dependencies (chi, go-sqlite3)
2. Set up SQLite database with migrations (create all tables)
3. Implement the store layer (CRUD for all asset types + settings)
4. Implement the HTTP server with chi router
5. Implement asset CRUD handlers
6. Implement settings handler

### Phase 2: Price Fetching
1. Implement stock price fetcher (Yahoo Finance free endpoint)
   - `GET https://query1.finance.yahoo.com/v8/finance/chart/{ticker}` or similar free endpoint
   - Parse response for current price
   - Cache prices in-memory for 15 minutes to avoid rate limits
2. Implement metals price fetcher
   - Use a free metals API (metals.dev or similar)
   - Cache prices in-memory for 1 hour (metals prices don't change as frequently)
3. Expose price endpoints

### Phase 3: Zakat Calculator
1. Implement the calculation engine in `internal/calculator/zakat.go`
2. Wire up the `/api/zakat/calculate` endpoint
3. Fetch all included assets, compute per-category totals, check nisab, compute zakat

### Phase 4: React Frontend
1. Scaffold Vite + React + TypeScript project in `web/`
2. Set up Tailwind CSS
3. Build API client layer
4. Build pages/components:
   - **Dashboard**: Summary cards showing total assets, nisab status, zakat owed, per-category breakdown
   - **Retirement page**: Table of accounts + add/edit form with penalty & tax overrides
   - **Investments page**: Table of stocks with current price, total value, term classification + add form (ticker, shares, purchase date)
   - **Savings page**: Simple table + add form (name, amount)
   - **Jewelry page**: Table of items with current metal price & computed value + add form (name, type, weight)
   - Each asset row has an include/exclude toggle
   - **Settings page**: Nisab method display, default penalty/tax rate overrides
5. Set up proxy in Vite dev config to forward `/api` to Go backend

### Phase 5: Production Build & Deployment
1. Configure Go to embed the `web/dist/` directory using `embed.FS`
2. Serve the React SPA from Go (single binary deployment)
3. Add a `Makefile` with targets: `dev`, `build`, `run`
4. Bind the server to `0.0.0.0:{port}` so other machines on the LAN can access it
5. Default port: `8080`, configurable via `PORT` env var or flag

---

## Free API Details

### Stock Prices (Yahoo Finance)
- Endpoint: `https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}?range=1d&interval=1d`
- No API key required
- Rate limit: be respectful, cache aggressively (15-min TTL)
- Fallback: if Yahoo changes their API, can switch to `https://finnhub.io` free tier (60 calls/min)

### Metal Prices
- Primary: `https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=gram`
- Alternative: scrape from a reliable public source
- Cache for 1 hour

---

## Key Design Decisions

1. **Single binary deployment**: Go embeds the built React frontend, so the user just runs one binary
2. **SQLite**: Simple, no external database needed, data stored in `./data/zakat.db`
3. **No authentication**: Single-user app on a local network, no auth needed
4. **In-memory price cache**: Avoids hammering free APIs; prices refresh on configurable intervals
5. **Silver-based Nisab**: Using 595g of silver as the Nisab threshold (more conservative)
6. **Fixed 2.5% Zakat rate**: No configuration needed
7. **10% default withdrawal penalty**: Standard US IRS early withdrawal penalty, overridable per account
8. **33% default tax rate**: Overridable per account
9. **1-year rule for investment classification**: Standard long-term vs short-term threshold
