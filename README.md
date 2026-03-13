# Mono Carton Box Pricing App

Simple browser-based calculator for mono carton box quotations.

## What it does

- Accepts box dimensions in **W × B × H (cm)**.
- Accepts variable rates for board, diecut, creasing, lamination, pasting, window cutting.
- Uses quantity-based mode selection:
  - **1 to 300 qty** → digital mode (if die fits **12.5 × 18.5 in**)
  - **> 300 qty** → offset mode
- Adds wastage % and profit %.
- Returns total quote and unit price.

## Die-size assumption used

- Die width = `2 × (W + B) + glue flap`
- Die height = `H + (top-bottom flap factor × B)`

You can tune glue flap and flap factor from the UI based on your box style.

## Run

Open `index.html` directly in a browser.
