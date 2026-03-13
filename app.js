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

  const mode = quantity <= 300 && fitsDigital ? 'Digital Print + Digital Cut/Paste' : 'Offset Print';
  const printRate = mode.startsWith('Digital') ? printRateDigital : printRateOffset;

  const processRatePerBox = boardRate + printRate + diecutRate + creasingRate + laminationRate + pastingRate + windowCutRate;
  const qtyWithWastage = Math.ceil(quantity * (1 + (wastagePercent / 100)));

  const baseTotal = qtyWithWastage * processRatePerBox;
  const finalTotal = baseTotal * (1 + (profitPercent / 100));
  const unitPrice = finalTotal / quantity;

  return {
    mode,
    quantity,
    qtyWithWastage,
    dieWidthCm,
    dieHeightCm,
    dieWidthIn,
    dieHeightIn,
    fitsDigital,
    processRatePerBox,
    baseTotal,
    finalTotal,
    unitPrice,
  };
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
      <div>Quantity with Wastage</div><div>${result.qtyWithWastage}</div>
      <div>Cost per Box (before wastage/profit)</div><div>${money(result.processRatePerBox)}</div>
      <div>Base Total</div><div>${money(result.baseTotal)}</div>
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
