# BTR Rental Comparables Dashboard

A clean, modern, static web dashboard for Build&nbsp;to&nbsp;Rent (BTR) rental
comparables. It fetches **live JSON** from a Ninox shared URL every time the
page loads, then lets you filter, search, visualise and export the data.

Built with **React + Vite + JavaScript** (no TypeScript).

## Features

- Live fetch from Ninox on every page load, with loading and error states.
- Savills-style theme: dark blue (`#25273A`) primary with yellow (`#FFDF00`) accent.
- Summary cards: total records, unique schemes, unique towns, latest update.
- Dropdown filters: Date, Town, Region, Operator, Amenity grade, Source,
  Source verified, Stabilised.
- Free-text search across Scheme, Town, Operator, Amenities and Comments.
- Full-viewport, app-like layout (no page scrolling) with **Dashboard** and
  **Analysis** tabs.
- Sortable, scrollable table with sticky header, sticky scheme column and a
  fixed-width checkbox column for row selection (select all filtered / clear).
- Summary cards: total records, unique schemes, current quarter, last updated.
- Formatting: occupancy as %, rent as `£ pcm`, psf to 2 dp, and `0`/blank
  values shown as empty cells.
- Analysis tab with a responsive chart grid: average rates by town, average
  rent/£psf by region, records by date, source distribution, stabilised split
  and amenity-grade distribution (all blended charts ignore zero/blank values).
- Reset filters and **export to XLSX** — exports ticked rows if any are
  selected, otherwise all currently filtered rows (`rental_comps_export.xlsx`).
- Responsive / mobile-friendly layout.

## Configuration

Ninox share URLs are supplied via Vite environment variables (never committed):

- `VITE_RENTAL_COMPS_URL` — read in [`src/config/dataSource.js`](src/config/dataSource.js)
- `VITE_OPERATIONAL_COSTS_URL` — read in [`src/modules/operational-costs/config/dataSource.js`](src/modules/operational-costs/config/dataSource.js)

Locally, put both in `.env.local` (gitignored). GitHub Pages builds receive them from repository secrets in `.github/workflows/deploy.yml`.

The Vite `base` is set to `'./'` (relative paths), so the build works under any
GitHub Pages sub-path without further configuration.

## Project structure

The codebase is organised into `config/`, `hooks/`, `utils/`, `components/`
(grouped by feature) and `styles/`. See
[`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) for the full map and a
"where do I change X?" table, and
[`docs/MOBILE_CHECKLIST.md`](docs/MOBILE_CHECKLIST.md) for the responsiveness QA
checklist.

```
src/
  main.jsx                 # entry point
  App.jsx                  # thin shell (data hook + tabs + shared state)
  config/                  # dataSource, filterConfig, tableColumns, exportColumns, theme
  hooks/useRentalComps.js  # live Ninox fetch
  utils/                   # formatters, filters, dateUtils, analysis, exportXlsx
  components/
    common/                # States, Tabs
    dashboard/             # DashboardTab, SummaryCards
    filters/               # FilterPanel
    table/                 # RentalCompsTable
    analysis/              # AnalysisTab, ChartCard
  styles/index.css         # all styling
docs/                      # PROJECT_STRUCTURE.md, MOBILE_CHECKLIST.md
```
