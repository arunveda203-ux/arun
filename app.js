const CM_TO_INCH = 0.3937007874;
const DIGITAL_MAX_WIDTH_IN = 12.5;
const DIGITAL_MAX_HEIGHT_IN = 18.5;

function val(id) {
  return Number(document.getElementById(id).value);
}

function money(num) {
  return `₹ ${num.toFixed(2)}`;
}

function calculate() {
  const widthCm = val('widthCm');
  const breadthCm = val('breadthCm');
  const heightCm = val('heightCm');
  const glueFlapCm = val('glueFlapCm');
  const topBottomFlapFactor = val('topBottomFlapFactor');

  const quantity = Math.max(1, Math.round(val('quantity')));

  const boardRate = val('boardRate');
  const printRateDigital = val('printRateDigital');
  const printRateOffset = val('printRateOffset');
  const diecutRate = val('diecutRate');
  const creasingRate = val('creasingRate');
  const laminationRate = val('laminationRate');
  const pastingRate = val('pastingRate');
  const windowCutRate = val('windowCutRate');
  const wastagePercent = val('wastagePercent');
  const profitPercent = val('profitPercent');

  if ([widthCm, breadthCm, heightCm].some((x) => x <= 0)) {
    return { error: 'Box dimensions must be greater than zero.' };
  }

  const dieWidthCm = (2 * (widthCm + breadthCm)) + glueFlapCm;
  const dieHeightCm = heightCm + (topBottomFlapFactor * breadthCm);

  const dieWidthIn = dieWidthCm * CM_TO_INCH;
  const dieHeightIn = dieHeightCm * CM_TO_INCH;

  const fitsDigital =
    (dieWidthIn <= DIGITAL_MAX_WIDTH_IN && dieHeightIn <= DIGITAL_MAX_HEIGHT_IN) ||
    (dieHeightIn <= DIGITAL_MAX_WIDTH_IN && dieWidthIn <= DIGITAL_MAX_HEIGHT_IN);

  const isDigital = quantity <= 300 && fitsDigital;
  const mode = isDigital ? 'Digital Print + Digital Cut/Paste' : 'Offset Print';
  const printRate = isDigital ? printRateDigital : printRateOffset;

  const sectionRates = [
    { label: 'Board', rate: boardRate },
    { label: `Print (${isDigital ? 'Digital' : 'Offset'})`, rate: printRate },
    { label: 'Diecut', rate: diecutRate },
    { label: 'Creasing', rate: creasingRate },
    { label: 'Lamination', rate: laminationRate },
    { label: 'Pasting', rate: pastingRate },
    { label: 'Window Cutting', rate: windowCutRate },
  ];

  const processRatePerBox = sectionRates.reduce((sum, section) => sum + section.rate, 0);
  const qtyWithWastage = Math.ceil(quantity * (1 + (wastagePercent / 100)));
  const wastageUnits = qtyWithWastage - quantity;

  const sectionTotals = sectionRates.map((section) => ({
    ...section,
    total: section.rate * qtyWithWastage,
  }));

  const baseTotal = sectionTotals.reduce((sum, section) => sum + section.total, 0);
  const profitValue = baseTotal * (profitPercent / 100);
  const finalTotal = baseTotal + profitValue;
  const unitPrice = finalTotal / quantity;

  return {
    mode,
    quantity,
    qtyWithWastage,
    wastageUnits,
    dieWidthCm,
    dieHeightCm,
    dieWidthIn,
    dieHeightIn,
    fitsDigital,
    processRatePerBox,
    sectionTotals,
    baseTotal,
    profitValue,
    finalTotal,
    unitPrice,
    wastagePercent,
    profitPercent,
  };
}

function renderSectionRows(sectionTotals) {
  return sectionTotals
    .map(
      (section) => `
      <div>${section.label} (₹/box)</div><div>${money(section.rate)}</div>
      <div>${section.label} Total</div><div>${money(section.total)}</div>
    `,
    )
    .join('');
}

function render(result) {
  const card = document.getElementById('resultCard');
  const root = document.getElementById('result');
  card.hidden = false;

  if (result.error) {
    root.innerHTML = `<p class="warn">${result.error}</p>`;
    return;
  }

  const warning = !result.fitsDigital && result.quantity <= 300
    ? '<p class="warn">Die size exceeds 12.5 × 18.5 in; moved to offset mode.</p>'
    : '';

  root.innerHTML = `
    <div class="result-grid">
      <div>Selected Production Mode</div><div><strong>${result.mode}</strong></div>
      <div>Die Size (cm)</div><div>${result.dieWidthCm.toFixed(2)} × ${result.dieHeightCm.toFixed(2)}</div>
      <div>Die Size (in)</div><div>${result.dieWidthIn.toFixed(2)} × ${result.dieHeightIn.toFixed(2)}</div>
      <div>Order Quantity</div><div>${result.quantity}</div>
      <div>Wastage %</div><div>${result.wastagePercent.toFixed(2)}%</div>
      <div>Wastage Units</div><div>${result.wastageUnits}</div>
      <div>Quantity with Wastage</div><div>${result.qtyWithWastage}</div>
      ${renderSectionRows(result.sectionTotals)}
      <div>Cost per Box (all sections)</div><div>${money(result.processRatePerBox)}</div>
      <div>Base Total (all section totals)</div><div>${money(result.baseTotal)}</div>
      <div>Profit %</div><div>${result.profitPercent.toFixed(2)}%</div>
      <div>Profit Value</div><div>${money(result.profitValue)}</div>
      <div>Final Total Quote</div><div><strong>${money(result.finalTotal)}</strong></div>
      <div>Final Unit Price</div><div><strong>${money(result.unitPrice)}</strong></div>
    </div>
    ${warning}
  `;
}

document.getElementById('calculateBtn').addEventListener('click', () => {
  render(calculate());
});

render(calculate());
