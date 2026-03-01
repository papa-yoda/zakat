package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"zakat/internal/model"
	"zakat/internal/store"
)

type AssetsHandler struct {
	store store.Store
}

func NewAssetsHandler(s store.Store) *AssetsHandler {
	return &AssetsHandler{store: s}
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func parseID(r *http.Request) (int64, error) {
	return strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
}

// --- Retirement ---

func (h *AssetsHandler) ListRetirement(w http.ResponseWriter, r *http.Request) {
	accounts, err := h.store.GetRetirementAccounts()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, accounts)
}

func (h *AssetsHandler) CreateRetirement(w http.ResponseWriter, r *http.Request) {
	var a model.RetirementAccount
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	if err := h.store.CreateRetirementAccount(&a); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, a)
}

func (h *AssetsHandler) UpdateRetirement(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var a model.RetirementAccount
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	a.ID = id
	if err := h.store.UpdateRetirementAccount(&a); err != nil {
		if err.Error() == "not found" {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, a)
}

func (h *AssetsHandler) DeleteRetirement(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.store.DeleteRetirementAccount(id); err != nil {
		if err.Error() == "not found" {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusOK)
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

// --- Investments ---

func (h *AssetsHandler) ListInvestments(w http.ResponseWriter, r *http.Request) {
	investments, err := h.store.GetInvestments()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, investments)
}

func (h *AssetsHandler) CreateInvestment(w http.ResponseWriter, r *http.Request) {
	var inv model.Investment
	if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	if err := h.store.CreateInvestment(&inv); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, inv)
}

func (h *AssetsHandler) UpdateInvestment(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var inv model.Investment
	if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	inv.ID = id
	if err := h.store.UpdateInvestment(&inv); err != nil {
		if err.Error() == "not found" {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, inv)
}

func (h *AssetsHandler) DeleteInvestment(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.store.DeleteInvestment(id); err != nil {
		if err.Error() == "not found" {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

// --- Savings ---

func (h *AssetsHandler) ListSavings(w http.ResponseWriter, r *http.Request) {
	savings, err := h.store.GetSavings()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, savings)
}

func (h *AssetsHandler) CreateSavings(w http.ResponseWriter, r *http.Request) {
	var s model.Savings
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	if err := h.store.CreateSavings(&s); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, s)
}

func (h *AssetsHandler) UpdateSavings(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var s model.Savings
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	s.ID = id
	if err := h.store.UpdateSavings(&s); err != nil {
		if err.Error() == "not found" {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, s)
}

func (h *AssetsHandler) DeleteSavings(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.store.DeleteSavings(id); err != nil {
		if err.Error() == "not found" {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

// --- Jewelry ---

func (h *AssetsHandler) ListJewelry(w http.ResponseWriter, r *http.Request) {
	jewelry, err := h.store.GetJewelry()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, jewelry)
}

func (h *AssetsHandler) CreateJewelry(w http.ResponseWriter, r *http.Request) {
	var j model.Jewelry
	if err := json.NewDecoder(r.Body).Decode(&j); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	if err := h.store.CreateJewelry(&j); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, j)
}

func (h *AssetsHandler) UpdateJewelry(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var j model.Jewelry
	if err := json.NewDecoder(r.Body).Decode(&j); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	j.ID = id
	if err := h.store.UpdateJewelry(&j); err != nil {
		if err.Error() == "not found" {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, j)
}

func (h *AssetsHandler) DeleteJewelry(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.store.DeleteJewelry(id); err != nil {
		if err.Error() == "not found" {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}
