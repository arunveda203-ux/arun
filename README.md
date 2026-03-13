# Mono Carton Box Pricing App

Simple browser-based calculator for mono carton box quotations.

## What it does

- Accepts box dimensions in **W × B × H (cm)**.
- Accepts variable rates for board, diecut, creasing, lamination, pasting, window cutting.
- Uses quantity-based mode selection:
  - **1 to 300 qty** → digital mode (if die fits **12.5 × 18.5 in**)
  - **> 300 qty** → offset mode
- Adds wastage % and profit %.
- Returns total quote, unit price, and detailed section-wise price breakup.

## Die-size assumption used

- Die width = `2 × (W + B) + glue flap`
- Die height = `H + (top-bottom flap factor × B)`

You can tune glue flap and flap factor from the UI based on your box style.

## Pricing logic (all sections)

1. **Choose mode**
   - If quantity is `<= 300` and die size fits in `12.5 × 18.5 in` (any orientation), use **Digital Print + Digital Cut/Paste**.
   - Otherwise use **Offset Print**.

2. **Create section rates per box**
   - Board
   - Print (Digital or Offset based on selected mode)
   - Diecut
   - Creasing
   - Lamination
   - Pasting
   - Window Cutting

3. **Calculate cost per box**
   - `Cost per box = Sum of all section rates`

4. **Apply wastage quantity**
   - `Qty with wastage = ceil(order qty × (1 + wastage% / 100))`
   - Section totals are calculated using wastage quantity.

5. **Calculate section totals**
   - `Section total = section rate × qty with wastage`

6. **Base total and profit**
   - `Base total = Sum of all section totals`
   - `Profit value = Base total × (profit% / 100)`

7. **Final quote**
   - `Final total quote = Base total + Profit value`
   - `Final unit price = Final total quote / ordered qty`

## Run

Open `index.html` directly in a browser.
