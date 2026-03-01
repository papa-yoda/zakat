package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"zakat/internal/prices"
)

type PricesHandler struct{}

func NewPricesHandler() *PricesHandler {
	return &PricesHandler{}
}

func (h *PricesHandler) GetStockPrice(w http.ResponseWriter, r *http.Request) {
	ticker := chi.URLParam(r, "ticker")
	if ticker == "" {
		writeError(w, http.StatusBadRequest, "ticker is required")
		return
	}

	price, err := prices.GetStockPrice(ticker)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"ticker": ticker,
		"price":  price,
	})
}

func (h *PricesHandler) GetMetalPrices(w http.ResponseWriter, r *http.Request) {
	metalPrices, err := prices.GetMetalPrices()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, metalPrices)
}
