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

## Reverse Tuck End (RTE) — exact formula structure draft

> This section defines a style-specific dieline formula structure for **RTE** cartons so logic can match tools like Pacdora more closely than a single flap-factor approximation.

### 1) Inputs (manufacture dimensions)

- `L` = panel length (mm)
- `W` = panel width (mm)
- `H` = body height (mm)
- `t` = board thickness (mm)

### 2) Style constants (RTE template parameters)

- `G` = glue-tab width (mm)
- `k_top_main` = top tuck main flap factor on `W`
- `k_top_dust` = top dust flap factor on `L`
- `k_bot_main` = bottom tuck main flap factor on `W`
- `k_bot_dust` = bottom dust flap factor on `L`
- `a_top` = top trim/lock allowance (mm)
- `a_bot` = bottom trim/lock allowance (mm)
- `a_bleed_x` = horizontal outer allowance for knife/bleed (mm)
- `a_bleed_y` = vertical outer allowance for knife/bleed (mm)
- `c_len`, `c_wid`, `c_hgt` = score compensation coefficients for thickness (dimension-mode conversion)

### 3) Panel development (creased body only)

- Body development width:
  - `BodyW = 2L + 2W + G`
- Body development height:
  - `BodyH = H`

### 4) Closure system heights (RTE geometry)

- Top closure stack:
  - `TopMain = k_top_main × W`
  - `TopDust = k_top_dust × L`
  - `TopStack = max(TopMain, TopDust) + a_top`
- Bottom closure stack:
  - `BotMain = k_bot_main × W`
  - `BotDust = k_bot_dust × L`
  - `BotStack = max(BotMain, BotDust) + a_bot`

### 5) Dieline trim size (before bleed)

- Horizontal trim span:
  - `TrimX = BodyW`
- Vertical trim span:
  - `TrimY = BodyH + TopStack + BotStack`

### 6) Dieline bleed/knife outer size (sheet-fit size)

- `DieX = TrimX + 2 × a_bleed_x`
- `DieY = TrimY + 2 × a_bleed_y`

Use `DieX × DieY` for digital-sheet fit tests (e.g., 12.5 × 18.5 in with rotation check).

### 7) Dimension-mode conversion (manufacture/inner/outer)

A practical coefficient model:

- `InnerL = L - c_len × t`
- `InnerW = W - c_wid × t`
- `InnerH = H - c_hgt × t`

- `OuterL = L + c_len × t`
- `OuterW = W + c_wid × t`
- `OuterH = H + c_hgt × t`

> Example calibration from your screenshot trend (t = 0.5 mm): coefficients are near `c_len≈1.2`, `c_wid≈1.2`, `c_hgt≈2.2`, which explains inner/outer offsets around ±0.6 mm on L/W and ±1.1 mm on H.

### 8) Pacdora-style calibration workflow for RTE

1. Fix one RTE template and material class.
2. Collect 20–30 Pacdora samples across L/W/H/t ranges.
3. Solve for `G`, `k_*`, `a_*`, and `c_*` via least-squares fitting to Pacdora’s displayed trim/outer sizes.
4. Validate max error targets (e.g., ±0.5 mm on trim spans).
5. Freeze as **RTE v1 constants** for production quoting.

## Run

Open `index.html` directly in a browser.
