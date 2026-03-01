package handler

import (
	"bufio"
	"encoding/csv"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"zakat/internal/model"
)

var sectionRegex = regexp.MustCompile(`^\[(\w+)\]$`)

func (h *DataHandler) Import(w http.ResponseWriter, r *http.Request) {
	file, _, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing file upload")
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	var currentSection string
	var headerSkipped bool

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		if matches := sectionRegex.FindStringSubmatch(line); matches != nil {
			// Starting a new section — delete existing data for this section
			currentSection = matches[1]
			headerSkipped = false

			if err := h.deleteSection(currentSection); err != nil {
				writeError(w, http.StatusInternalServerError, err.Error())
				return
			}
			continue
		}

		if !headerSkipped {
			headerSkipped = true
			continue
		}

		if currentSection == "" {
			continue
		}

		reader := csv.NewReader(strings.NewReader(line))
		fields, err := reader.Read()
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid CSV row: "+line)
			return
		}

		if err := h.importRow(currentSection, fields); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if err := scanner.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "success"})
}

func (h *DataHandler) deleteSection(section string) error {
	switch section {
	case "retirement":
		accounts, err := h.store.GetRetirementAccounts()
		if err != nil {
			return err
		}
		for _, a := range accounts {
			if err := h.store.DeleteRetirementAccount(a.ID); err != nil {
				return err
			}
		}
	case "investments":
		investments, err := h.store.GetInvestments()
		if err != nil {
			return err
		}
		for _, inv := range investments {
			if err := h.store.DeleteInvestment(inv.ID); err != nil {
				return err
			}
		}
	case "savings":
		savings, err := h.store.GetSavings()
		if err != nil {
			return err
		}
		for _, s := range savings {
			if err := h.store.DeleteSavings(s.ID); err != nil {
				return err
			}
		}
	case "jewelry":
		jewelry, err := h.store.GetJewelry()
		if err != nil {
			return err
		}
		for _, j := range jewelry {
			if err := h.store.DeleteJewelry(j.ID); err != nil {
				return err
			}
		}
	case "settings":
		// Nothing to delete for settings; they will be updated in place
	}
	return nil
}

func (h *DataHandler) importRow(section string, fields []string) error {
	switch section {
	case "retirement":
		if len(fields) < 5 {
			return fmt.Errorf("retirement row requires 5 fields")
		}
		balance, err := strconv.ParseFloat(fields[1], 64)
		if err != nil {
			return err
		}
		penalty, err := strconv.ParseFloat(fields[2], 64)
		if err != nil {
			return err
		}
		taxRate, err := strconv.ParseFloat(fields[3], 64)
		if err != nil {
			return err
		}
		included, err := strconv.ParseBool(fields[4])
		if err != nil {
			return err
		}
		return h.store.CreateRetirementAccount(&model.RetirementAccount{
			Name:              fields[0],
			Balance:           balance,
			WithdrawalPenalty: penalty,
			TaxRate:           taxRate,
			IncludedInZakat:   included,
		})

	case "investments":
		if len(fields) < 4 {
			return fmt.Errorf("investments row requires 4 fields")
		}
		shares, err := strconv.ParseFloat(fields[1], 64)
		if err != nil {
			return err
		}
		included, err := strconv.ParseBool(fields[3])
		if err != nil {
			return err
		}
		return h.store.CreateInvestment(&model.Investment{
			Ticker:          fields[0],
			Shares:          shares,
			PurchaseDate:    fields[2],
			IncludedInZakat: included,
		})

	case "savings":
		if len(fields) < 3 {
			return fmt.Errorf("savings row requires 3 fields")
		}
		amount, err := strconv.ParseFloat(fields[1], 64)
		if err != nil {
			return err
		}
		included, err := strconv.ParseBool(fields[2])
		if err != nil {
			return err
		}
		return h.store.CreateSavings(&model.Savings{
			Name:            fields[0],
			Amount:          amount,
			IncludedInZakat: included,
		})

	case "jewelry":
		if len(fields) < 7 {
			return fmt.Errorf("jewelry row requires 7 fields")
		}
		weight, err := strconv.ParseFloat(fields[2], 64)
		if err != nil {
			return err
		}
		includesGems, err := strconv.ParseBool(fields[3])
		if err != nil {
			return err
		}
		gemWeight, err := strconv.ParseFloat(fields[4], 64)
		if err != nil {
			return err
		}
		included, err := strconv.ParseBool(fields[6])
		if err != nil {
			return err
		}
		return h.store.CreateJewelry(&model.Jewelry{
			Name:            fields[0],
			MetalType:       fields[1],
			WeightGrams:     weight,
			IncludesGems:    includesGems,
			GemWeight:       gemWeight,
			GemWeightUnit:   fields[5],
			IncludedInZakat: included,
		})

	case "settings":
		if len(fields) < 3 {
			return fmt.Errorf("settings row requires 3 fields")
		}
		penalty, err := strconv.ParseFloat(fields[1], 64)
		if err != nil {
			return err
		}
		taxRate, err := strconv.ParseFloat(fields[2], 64)
		if err != nil {
			return err
		}
		return h.store.UpdateSettings(&model.Settings{
			NisabMethod:              fields[0],
			DefaultWithdrawalPenalty: penalty,
			DefaultTaxRate:           taxRate,
		})
	}
	return nil
}
