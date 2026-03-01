package handler

import (
	"net/http"

	"zakat/internal/calculator"
	"zakat/internal/store"
)

type ZakatHandler struct {
	store store.Store
}

func NewZakatHandler(s store.Store) *ZakatHandler {
	return &ZakatHandler{store: s}
}

func (h *ZakatHandler) Calculate(w http.ResponseWriter, r *http.Request) {
	result, err := calculator.Calculate(h.store)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}
