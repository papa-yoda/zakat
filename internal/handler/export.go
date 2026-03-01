package handler

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"

	"zakat/internal/store"
)

type DataHandler struct {
	store store.Store
}

func NewDataHandler(s store.Store) *DataHandler {
	return &DataHandler{store: s}
}

func (h *DataHandler) Export(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Disposition", `attachment; filename="zakat-data.csv"`)
	w.Header().Set("Content-Type", "text/csv")

	cw := csv.NewWriter(w)
	cw.UseCRLF = false

	// --- Retirement ---
	fmt.Fprintln(w, "[retirement]")
	cw.Write([]string{"name", "balance", "withdrawal_penalty", "tax_rate", "included_in_zakat"})
	cw.Flush()

	accounts, err := h.store.GetRetirementAccounts()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	for _, a := range accounts {
		cw.Write([]string{
			a.Name,
			fmt.Sprintf("%g", a.Balance),
			fmt.Sprintf("%g", a.WithdrawalPenalty),
			fmt.Sprintf("%g", a.TaxRate),
			strconv.FormatBool(a.IncludedInZakat),
		})
	}
	cw.Flush()

	// --- Investments ---
	fmt.Fprintln(w)
	fmt.Fprintln(w, "[investments]")
	cw.Write([]string{"ticker", "shares", "purchase_date", "included_in_zakat"})
	cw.Flush()

	investments, err := h.store.GetInvestments()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	for _, inv := range investments {
		cw.Write([]string{
			inv.Ticker,
			fmt.Sprintf("%g", inv.Shares),
			inv.PurchaseDate,
			strconv.FormatBool(inv.IncludedInZakat),
		})
	}
	cw.Flush()

	// --- Savings ---
	fmt.Fprintln(w)
	fmt.Fprintln(w, "[savings]")
	cw.Write([]string{"name", "amount", "included_in_zakat"})
	cw.Flush()

	savings, err := h.store.GetSavings()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	for _, s := range savings {
		cw.Write([]string{
			s.Name,
			fmt.Sprintf("%g", s.Amount),
			strconv.FormatBool(s.IncludedInZakat),
		})
	}
	cw.Flush()

	// --- Jewelry ---
	fmt.Fprintln(w)
	fmt.Fprintln(w, "[jewelry]")
	cw.Write([]string{"name", "metal_type", "weight_grams", "includes_gems", "gem_weight", "gem_weight_unit", "included_in_zakat"})
	cw.Flush()

	jewelry, err := h.store.GetJewelry()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	for _, j := range jewelry {
		cw.Write([]string{
			j.Name,
			j.MetalType,
			fmt.Sprintf("%g", j.WeightGrams),
			strconv.FormatBool(j.IncludesGems),
			fmt.Sprintf("%g", j.GemWeight),
			j.GemWeightUnit,
			strconv.FormatBool(j.IncludedInZakat),
		})
	}
	cw.Flush()

	// --- Settings ---
	fmt.Fprintln(w)
	fmt.Fprintln(w, "[settings]")
	cw.Write([]string{"nisab_method", "default_withdrawal_penalty", "default_tax_rate"})
	cw.Flush()

	settings, err := h.store.GetSettings()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	cw.Write([]string{
		settings.NisabMethod,
		fmt.Sprintf("%g", settings.DefaultWithdrawalPenalty),
		fmt.Sprintf("%g", settings.DefaultTaxRate),
	})
	cw.Flush()
}
