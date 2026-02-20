import type { Customer, MaintenanceRecord } from '../types';
import { TR, MAINTENANCE_TYPE_LABELS } from '../constants/tr';
import { formatDateTr } from './dates';
import { getNextDueDate } from './dates';

interface ServiceFormData {
  customer: Customer;
  record: MaintenanceRecord;
  nextMaintenanceDate: string;
  formNumber: string;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateFormNumber(record: MaintenanceRecord): string {
  const d = record.date.replace(/-/g, '');
  const suffix = record.id.slice(-4).toUpperCase();
  return `SF-${d}-${suffix}`;
}

function buildFormHtml(data: ServiceFormData): string {
  const { customer, record, nextMaintenanceDate, formNumber } = data;
  const e = escapeHtml;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TR.serviceFormTitle} - ${e(customer.name)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; font-size: 12.5px; color: #1a1a1a; padding: 24px; max-width: 800px; margin: 0 auto; background: #fff; }

  /* Print button */
  .no-print { margin-bottom: 24px; text-align: center; display: flex; gap: 12px; justify-content: center; }
  .no-print button { padding: 14px 36px; font-size: 15px; font-weight: 600; color: #fff; background: #0284c7; border: none; border-radius: 12px; cursor: pointer; letter-spacing: 0.3px; }
  .no-print button:hover { background: #0369a1; }
  .no-print button:active { background: #075985; }

  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0284c7; padding-bottom: 14px; margin-bottom: 6px; }
  .header-left { display: flex; align-items: center; gap: 14px; }
  .logo-circle { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #06b6d4); display: flex; align-items: center; justify-content: center; }
  .logo-circle svg { width: 28px; height: 28px; fill: white; }
  .header-text h1 { font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: 0.5px; }
  .header-text p { font-size: 12px; color: #64748b; margin-top: 1px; }
  .header-right { text-align: right; font-size: 11px; color: #64748b; line-height: 1.6; }
  .header-right strong { color: #334155; }

  /* Form title bar */
  .title-bar { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #0284c7, #0369a1); color: white; padding: 10px 16px; border-radius: 8px; margin: 14px 0 16px; }
  .title-bar h2 { font-size: 15px; font-weight: 700; letter-spacing: 1px; }
  .title-bar .form-no { font-size: 11px; opacity: 0.9; font-family: monospace; }

  /* Sections */
  .section { margin-bottom: 14px; page-break-inside: avoid; }
  .section-title { font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.8px; padding: 6px 10px; background: #f0f9ff; border-left: 3px solid #0284c7; border-radius: 0 4px 4px 0; margin-bottom: 8px; }

  /* Field grid */
  .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; padding: 0 4px; }
  .field { display: flex; align-items: baseline; gap: 6px; padding: 5px 0; }
  .field-label { font-weight: 600; color: #475569; white-space: nowrap; font-size: 11.5px; min-width: 105px; }
  .field-value { color: #1a1a1a; flex: 1; border-bottom: 1px solid #cbd5e1; min-height: 20px; padding-bottom: 2px; font-size: 12.5px; }
  .field-full { grid-column: 1 / -1; }

  /* Materials table */
  .materials-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 12px; }
  .materials-table th { background: #f1f5f9; color: #475569; font-weight: 600; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0; }
  .materials-table th:nth-child(2), .materials-table th:nth-child(3), .materials-table th:nth-child(4) { text-align: center; width: 80px; }
  .materials-table td { padding: 6px 10px; border: 1px solid #e2e8f0; vertical-align: middle; }
  .materials-table td:nth-child(2), .materials-table td:nth-child(3), .materials-table td:nth-child(4) { text-align: center; }
  .materials-table input { border: none; background: transparent; width: 100%; font-size: 12px; font-family: inherit; color: #1a1a1a; outline: none; padding: 2px 0; }
  .materials-table input[type="number"] { text-align: center; -moz-appearance: textfield; }
  .materials-table input[type="number"]::-webkit-outer-spin-button,
  .materials-table input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .materials-table .row-total { font-weight: 600; color: #0f172a; font-size: 12px; min-width: 60px; text-align: center; }
  .materials-table .remove-row { cursor: pointer; color: #94a3b8; font-size: 16px; border: none; background: none; padding: 0 4px; line-height: 1; }
  .materials-table .remove-row:hover { color: #ef4444; }

  .add-row-btn { margin-top: 6px; padding: 6px 14px; font-size: 12px; font-weight: 500; color: #0284c7; background: #f0f9ff; border: 1px dashed #93c5fd; border-radius: 6px; cursor: pointer; }
  .add-row-btn:hover { background: #e0f2fe; }

  /* Totals */
  .totals { display: flex; justify-content: flex-end; margin-top: 8px; }
  .totals-box { width: 260px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
  .total-row { display: flex; justify-content: space-between; padding: 7px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
  .total-row:last-child { border-bottom: none; }
  .total-row.grand { background: #0284c7; color: white; font-weight: 700; font-size: 13px; }
  .total-row .label { color: #475569; }
  .total-row.grand .label { color: rgba(255,255,255,0.9); }
  .total-row .value { font-weight: 600; }
  .kdv-select { border: none; background: transparent; font-size: 12px; color: #475569; font-family: inherit; cursor: pointer; outline: none; }

  /* Water quality */
  .water-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 0 4px; }
  .water-item { text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 8px; }
  .water-item .wlabel { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px; }
  .water-item .wvalue { border-bottom: 1px solid #cbd5e1; min-height: 22px; font-size: 14px; font-weight: 600; color: #0f172a; }

  /* Notes box */
  .notes-box { border: 1px solid #e2e8f0; border-radius: 6px; min-height: 60px; padding: 8px 10px; margin-top: 6px; font-size: 12px; line-height: 1.5; color: #1a1a1a; }

  /* Signatures */
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 20px; padding-top: 12px; }
  .signature-box { text-align: center; }
  .sig-label { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .sig-area { border: 1px solid #cbd5e1; border-radius: 6px; height: 70px; background: #fafafa; }
  .sig-name { font-size: 11px; color: #64748b; margin-top: 6px; }
  .approval-text { font-size: 10px; color: #64748b; text-align: center; margin-top: 12px; font-style: italic; }

  /* Footer */
  .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }

  @media print {
    .no-print { display: none !important; }
    .add-row-btn { display: none !important; }
    .materials-table .remove-row { display: none !important; }
    body { padding: 12px; font-size: 11.5px; }
    .header { padding-bottom: 10px; }
    .title-bar { margin: 10px 0 12px; }
    .section { margin-bottom: 10px; }
    .materials-table input { border-bottom: none; }
    .sig-area { height: 60px; }
  }
</style>
</head>
<body>

<div class="no-print">
  <button onclick="window.print()">${TR.printForm}</button>
</div>

<!-- Header -->
<div class="header">
  <div class="header-left">
    <div class="logo-circle">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
    </div>
    <div class="header-text">
      <h1>${e(TR.companyName)}</h1>
      <p>${e(TR.companyInfo)}</p>
    </div>
  </div>
  <div class="header-right">
    <strong>${TR.formNo}:</strong> ${e(formNumber)}<br>
    <strong>${e(TR.maintenanceDate)}:</strong> ${e(formatDateTr(record.date))}
  </div>
</div>

<!-- Title bar -->
<div class="title-bar">
  <h2>${TR.serviceFormTitle}</h2>
  <span class="form-no">${e(formNumber)}</span>
</div>

<!-- Customer info -->
<div class="section">
  <div class="section-title">${TR.customerInfo}</div>
  <div class="field-grid">
    <div class="field">
      <span class="field-label">${TR.customerName}:</span>
      <span class="field-value">${e(customer.name)}</span>
    </div>
    <div class="field">
      <span class="field-label">${TR.customerPhone}:</span>
      <span class="field-value">${e(customer.phone)}</span>
    </div>
    <div class="field field-full">
      <span class="field-label">${TR.customerAddress}:</span>
      <span class="field-value">${e(customer.address || '')}</span>
    </div>
    <div class="field">
      <span class="field-label">${TR.installationDate}:</span>
      <span class="field-value">${e(formatDateTr(customer.installationDate))}</span>
    </div>
  </div>
</div>

<!-- Device info -->
<div class="section">
  <div class="section-title">${TR.deviceInfo}</div>
  <div class="field-grid">
    <div class="field">
      <span class="field-label">${TR.deviceModel}:</span>
      <span class="field-value">${e(customer.deviceModel || '')}</span>
    </div>
    <div class="field">
      <span class="field-label">${TR.deviceSerial}:</span>
      <span class="field-value">${e(customer.deviceSerial || '')}</span>
    </div>
  </div>
</div>

<!-- Service info -->
<div class="section">
  <div class="section-title">${TR.serviceInfo}</div>
  <div class="field-grid">
    <div class="field">
      <span class="field-label">${TR.maintenanceDate}:</span>
      <span class="field-value">${e(formatDateTr(record.date))}</span>
    </div>
    <div class="field">
      <span class="field-label">${TR.maintenanceType}:</span>
      <span class="field-value">${e(MAINTENANCE_TYPE_LABELS[record.type] || record.type)}</span>
    </div>
    <div class="field">
      <span class="field-label">${TR.nextMaintenance}:</span>
      <span class="field-value">${e(formatDateTr(nextMaintenanceDate))}</span>
    </div>
  </div>
</div>

<!-- Water quality -->
<div class="section">
  <div class="section-title">${TR.waterQuality}</div>
  <div class="water-grid">
    <div class="water-item">
      <div class="wlabel">${TR.tdsInput}</div>
      <div class="wvalue" contenteditable="true"></div>
    </div>
    <div class="water-item">
      <div class="wlabel">${TR.tdsOutput}</div>
      <div class="wvalue" contenteditable="true"></div>
    </div>
    <div class="water-item">
      <div class="wlabel">${TR.retentionRate}</div>
      <div class="wvalue" id="retention">—</div>
    </div>
  </div>
</div>

<!-- Materials table -->
<div class="section">
  <div class="section-title">${TR.partsReplaced}</div>
  <table class="materials-table" id="materialsTable">
    <thead>
      <tr>
        <th>${TR.materialName}</th>
        <th>${TR.materialQty}</th>
        <th>${TR.materialPrice} (₺)</th>
        <th>${TR.materialTotal} (₺)</th>
        <th class="no-print" style="width:30px;"></th>
      </tr>
    </thead>
    <tbody id="materialsBody">
      <tr>
        <td><input type="text" placeholder="—" oninput="calc()"></td>
        <td><input type="number" value="1" min="1" oninput="calc()"></td>
        <td><input type="number" min="0" step="0.01" placeholder="0" oninput="calc()"></td>
        <td class="row-total">—</td>
        <td class="no-print"><button class="remove-row" onclick="removeRow(this)" title="Sil">×</button></td>
      </tr>
      <tr>
        <td><input type="text" placeholder="—" oninput="calc()"></td>
        <td><input type="number" value="1" min="1" oninput="calc()"></td>
        <td><input type="number" min="0" step="0.01" placeholder="0" oninput="calc()"></td>
        <td class="row-total">—</td>
        <td class="no-print"><button class="remove-row" onclick="removeRow(this)" title="Sil">×</button></td>
      </tr>
      <tr>
        <td><input type="text" placeholder="—" oninput="calc()"></td>
        <td><input type="number" value="1" min="1" oninput="calc()"></td>
        <td><input type="number" min="0" step="0.01" placeholder="0" oninput="calc()"></td>
        <td class="row-total">—</td>
        <td class="no-print"><button class="remove-row" onclick="removeRow(this)" title="Sil">×</button></td>
      </tr>
    </tbody>
  </table>
  <button class="add-row-btn no-print" onclick="addRow()">${TR.addRow}</button>

  <div class="totals">
    <div class="totals-box">
      <div class="total-row">
        <span class="label">${TR.subtotal}</span>
        <span class="value" id="subtotal">₺0,00</span>
      </div>
      <div class="total-row">
        <span class="label">
          <select class="kdv-select" id="kdvRate" onchange="calc()">
            <option value="0">${TR.kdv} (%0)</option>
            <option value="10">${TR.kdv} (%10)</option>
            <option value="20" selected>${TR.kdv} (%20)</option>
          </select>
        </span>
        <span class="value" id="kdvAmount">₺0,00</span>
      </div>
      <div class="total-row grand">
        <span class="label">${TR.grandTotal}</span>
        <span class="value" id="grandTotal">₺0,00</span>
      </div>
    </div>
  </div>
</div>

<!-- Technician notes -->
<div class="section">
  <div class="section-title">${TR.technicianNotes}</div>
  <div class="notes-box" contenteditable="true">${e(record.notes || '')}</div>
</div>

<!-- Signatures -->
<div class="signatures">
  <div class="signature-box">
    <div class="sig-label">${TR.technicianSignature}</div>
    <div class="sig-area"></div>
    <div class="sig-name"></div>
  </div>
  <div class="signature-box">
    <div class="sig-label">${TR.customerSignature}</div>
    <div class="sig-area"></div>
    <div class="sig-name">${e(customer.name)}</div>
  </div>
</div>
<p class="approval-text">${TR.customerApproval}</p>

<!-- Footer -->
<div class="footer">
  ${e(TR.companyName)} · ${e(TR.companyInfo)} · ${e(formNumber)} · ${e(formatDateTr(record.date))}
</div>

<script>
function formatMoney(n) {
  return '₺' + n.toFixed(2).replace('.', ',').replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
}

function calc() {
  var rows = document.querySelectorAll('#materialsBody tr');
  var subtotal = 0;
  rows.forEach(function(row) {
    var inputs = row.querySelectorAll('input');
    var qty = parseFloat(inputs[1].value) || 0;
    var price = parseFloat(inputs[2].value) || 0;
    var total = qty * price;
    row.querySelector('.row-total').textContent = total > 0 ? formatMoney(total) : '—';
    subtotal += total;
  });
  var kdvRate = parseFloat(document.getElementById('kdvRate').value) || 0;
  var kdv = subtotal * kdvRate / 100;
  document.getElementById('subtotal').textContent = formatMoney(subtotal);
  document.getElementById('kdvAmount').textContent = formatMoney(kdv);
  document.getElementById('grandTotal').textContent = formatMoney(subtotal + kdv);
}

function addRow() {
  var tbody = document.getElementById('materialsBody');
  var tr = document.createElement('tr');
  tr.innerHTML = '<td><input type="text" placeholder="—" oninput="calc()"></td>' +
    '<td><input type="number" value="1" min="1" oninput="calc()"></td>' +
    '<td><input type="number" min="0" step="0.01" placeholder="0" oninput="calc()"></td>' +
    '<td class="row-total">—</td>' +
    '<td class="no-print"><button class="remove-row" onclick="removeRow(this)" title="Sil">×</button></td>';
  tbody.appendChild(tr);
}

function removeRow(btn) {
  var tbody = document.getElementById('materialsBody');
  if (tbody.rows.length > 1) {
    btn.closest('tr').remove();
    calc();
  }
}

// Auto-calculate TDS retention
document.addEventListener('input', function(evt) {
  if (evt.target.closest && evt.target.closest('.water-item')) {
    var items = document.querySelectorAll('.water-item .wvalue');
    var inp = parseFloat(items[0].textContent) || 0;
    var out = parseFloat(items[1].textContent) || 0;
    var ret = document.getElementById('retention');
    if (inp > 0 && out >= 0) {
      ret.textContent = (((inp - out) / inp) * 100).toFixed(0) + '%';
    } else {
      ret.textContent = '—';
    }
  }
});

${record.cost != null && record.cost > 0 ? `
// Pre-fill cost into first material row price column
(function() {
  var inputs = document.querySelectorAll('#materialsBody tr:first-child input[type="number"]');
  if (inputs[1]) { inputs[1].value = ${record.cost}; calc(); }
})();
` : ''}
</script>

</body>
</html>`;
}

export function generateServiceForm(customer: Customer, record: MaintenanceRecord): void {
  const nextMaintenanceDate = getNextDueDate(
    customer.installationDate,
    record.date,
    customer.maintenanceCycleMonths
  );

  const formNumber = generateFormNumber(record);
  const html = buildFormHtml({ customer, record, nextMaintenanceDate, formNumber });

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('afterprint', () => URL.revokeObjectURL(url));
  } else {
    // Fallback for PWA: download the HTML
    const a = document.createElement('a');
    a.href = url;
    a.download = `servis-formu-${customer.name.replace(/\s+/g, '-')}-${record.date}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
