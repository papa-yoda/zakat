package server

import (
	"io/fs"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"zakat/internal/handler"
	"zakat/internal/store"
)

func New(s store.Store, staticFiles fs.FS) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	assets := handler.NewAssetsHandler(s)
	settings := handler.NewSettingsHandler(s)
	pricesH := handler.NewPricesHandler()
	zakatH := handler.NewZakatHandler(s)

	r.Route("/api", func(r chi.Router) {
		// Retirement
		r.Get("/retirement", assets.ListRetirement)
		r.Post("/retirement", assets.CreateRetirement)
		r.Put("/retirement/{id}", assets.UpdateRetirement)
		r.Delete("/retirement/{id}", assets.DeleteRetirement)

		// Investments
		r.Get("/investments", assets.ListInvestments)
		r.Post("/investments", assets.CreateInvestment)
		r.Put("/investments/{id}", assets.UpdateInvestment)
		r.Delete("/investments/{id}", assets.DeleteInvestment)

		// Savings
		r.Get("/savings", assets.ListSavings)
		r.Post("/savings", assets.CreateSavings)
		r.Put("/savings/{id}", assets.UpdateSavings)
		r.Delete("/savings/{id}", assets.DeleteSavings)

		// Jewelry
		r.Get("/jewelry", assets.ListJewelry)
		r.Post("/jewelry", assets.CreateJewelry)
		r.Put("/jewelry/{id}", assets.UpdateJewelry)
		r.Delete("/jewelry/{id}", assets.DeleteJewelry)

		// Settings
		r.Get("/settings", settings.GetSettings)
		r.Put("/settings", settings.UpdateSettings)

		// Prices
		r.Get("/prices/stock/{ticker}", pricesH.GetStockPrice)
		r.Get("/prices/metals", pricesH.GetMetalPrices)

		// Zakat
		r.Get("/zakat/calculate", zakatH.Calculate)
	})

	// Serve React SPA for all non-API routes
	if staticFiles != nil {
		r.Get("/*", spaHandler(staticFiles))
	}

	return r
}

// spaHandler serves static files from the embedded FS, falling back to
// index.html for any path that doesn't map to a real file (React Router support).
func spaHandler(staticFiles fs.FS) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}

		f, err := staticFiles.Open(path)
		if err != nil {
			// SPA fallback: unknown paths go to index.html
			http.ServeFileFS(w, r, staticFiles, "index.html")
			return
		}
		stat, err := f.Stat()
		f.Close()
		if err != nil || stat.IsDir() {
			http.ServeFileFS(w, r, staticFiles, "index.html")
			return
		}

		http.ServeFileFS(w, r, staticFiles, path)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
