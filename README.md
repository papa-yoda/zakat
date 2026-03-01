# Zakat Calculator

A simple app to calculate your yearly Zakat obligation. Track retirement accounts, investments, savings, and jewelry — the app handles the math using current market prices.

## Use it online (family members)

Visit **https://ahmedawais.github.io/zakat/** — no download needed. Enter your assets and prices manually; data is saved in your browser.

## Download & run locally

Download the latest release for your platform from the [Releases page](../../releases/latest).

### macOS

1. Unzip the downloaded file
2. Double-click **start.command**
3. If macOS blocks it: right-click → Open, or run `xattr -cr .` in the unzipped folder via Terminal

### Windows

1. Unzip the downloaded file
2. Double-click **start.bat**
3. If SmartScreen warns you: click "More info" → "Run anyway"

The app opens automatically in your browser at `http://localhost:8080`.

### Access from other devices

Find your computer's IP address and open `http://<your-ip>:8080` from any device on the same network.

## How to use

- **Dashboard** — overview of your total zakatable assets, nisab threshold, and zakat owed (2.5%)
- **Retirement** — add 401k/IRA accounts with withdrawal penalty and tax rate deductions
- **Investments** — add stock tickers; current prices are fetched automatically (local version) or entered manually (online version)
- **Savings** — add bank accounts and cash holdings
- **Jewelry** — add gold/silver items with gem weight deductions
- **Settings** — choose nisab method (gold 85g or silver 595g) and set default penalty/tax rates

Use the **include/exclude toggle** on each item to control what counts toward your zakat.

## Saving & loading your data (CSV)

- Click **Export CSV** in the sidebar to download all your data as a CSV file
- Click **Import CSV** to load a previously exported file
- Share CSV files between family members so everyone can review the same data

## Backing up (local version)

Your data is stored in `data/zakat.db` next to the binary. Copy this file to back up.

## Changing the port

Edit the `.env` file next to the binary:

```
PORT=3000
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port already in use | Change PORT in `.env` or close the other app using port 8080 |
| Browser doesn't open | Open `http://localhost:8080` manually |
| macOS: "app is damaged" | Run `xattr -cr .` in Terminal from the app folder |
| Windows SmartScreen | Click "More info" → "Run anyway" |
| Nothing works | Make sure you unzipped the file first — don't run from inside the zip |
