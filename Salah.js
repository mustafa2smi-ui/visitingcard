/**
 * Salah.js - Enhanced Application Logic for Salah Time Chart
 */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SalahApp = {
  currentMonthIndex: 9, // October
  monthsData: {},
  orientation: "portrait",
  config: {
    startMinutes: 3 * 60,       // 03:00 AM
    endMinutes: 21 * 60,         // 21:00 (09:00 PM)
    totalMinutes: (21 - 3) * 60, // 1080 min
    stepMinutes: 15
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initMonthsStore();
  renderMonthTabs();
  initUIListeners();
  renderDataTable();
  renderChartPreview();
});

function initMonthsStore() {
  for (let m = 0; m < 12; m++) {
    SalahApp.monthsData[m] = generateMonthData(m);
  }
}

function generateMonthData(monthIndex) {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIndex];
  const list = [];
  const seasonalShift = Math.sin((monthIndex / 12) * Math.PI * 2) * 40;

  for (let day = 1; day <= daysInMonth; day++) {
    const fMin = Math.round(4 * 60 + 20 - (seasonalShift * 0.5) - (day * 0.4));
    const srMin = Math.round(5 * 60 + 40 - (seasonalShift * 0.6) - (day * 0.5));
    const zMin = 12 * 60 + 15;
    const aMin = Math.round(15 * 60 + 40 + (seasonalShift * 0.3) + (day * 0.3));
    const ssMin = Math.round(18 * 60 + 30 + (seasonalShift * 0.6) + (day * 0.5));
    const iMin = Math.round(19 * 60 + 50 + (seasonalShift * 0.5) + (day * 0.5));

    list.push({
      day: day,
      fajr: minutesToTime(fMin),
      sunrise: minutesToTime(srMin),
      zuhr: minutesToTime(zMin),
      asr: minutesToTime(aMin),
      sunset: minutesToTime(ssMin),
      isha: minutesToTime(iMin)
    });
  }
  return list;
}

function renderMonthTabs() {
  const container = document.getElementById("monthTabsContainer");
  container.innerHTML = "";

  MONTH_NAMES.forEach((name, idx) => {
    const btn = document.createElement("button");
    btn.className = `month-tab-btn ${idx === SalahApp.currentMonthIndex ? "active" : ""}`;
    btn.textContent = name;
    btn.onclick = () => {
      SalahApp.currentMonthIndex = idx;
      document.querySelectorAll(".month-tab-btn").forEach((b, i) => {
        b.classList.toggle("active", i === idx);
      });
      document.getElementById("inputGregorianDate").value = `${name} 2026`;
      renderDataTable();
      renderChartPreview();
    };
    container.appendChild(btn);
  });
}

function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(" ")[0].split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return (isNaN(h) || isNaN(m)) ? null : h * 60 + m;
}

function minutesToTime(totalMin) {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function getYPercent(minutes) {
  if (minutes === null) return 0;
  const clamped = Math.max(SalahApp.config.startMinutes, Math.min(SalahApp.config.endMinutes, minutes));
  return ((clamped - SalahApp.config.startMinutes) / SalahApp.config.totalMinutes) * 100;
}

function calculateDayLength(srStr, ssStr) {
  const srMin = timeToMinutes(srStr);
  const ssMin = timeToMinutes(ssStr);
  if (srMin === null || ssMin === null || ssMin <= srMin) return "";
  const diff = ssMin - srMin;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

function initUIListeners() {
  document.getElementById("printBtn").onclick = () => window.print();
  document.getElementById("downloadPdfBtn").onclick = downloadA4Pdf;

  document.getElementById("orientationSelect").onchange = (e) => {
    SalahApp.orientation = e.target.value;
    renderChartPreview();
  };

  document.getElementById("modeSelect").onchange = () => renderChartPreview();

  const liveInputs = [
    "inputMosque", "inputLocation", "inputGregorianDate", "inputIslamicDate",
    "dua1", "dua2", "dua3", "dua4",
    "labelFajr", "labelSunrise", "labelZuhr", "labelAsr", "labelMaghrib", "labelIsha"
  ];
  liveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => renderChartPreview());
  });

  document.getElementById("loadSampleBtn").onclick = () => {
    SalahApp.monthsData[SalahApp.currentMonthIndex] = generateMonthData(SalahApp.currentMonthIndex);
    renderDataTable();
    renderChartPreview();
  };

  document.getElementById("clearDataBtn").onclick = () => {
    if (confirm(`Clear all data for ${MONTH_NAMES[SalahApp.currentMonthIndex]}?`)) {
      SalahApp.monthsData[SalahApp.currentMonthIndex] = [];
      renderDataTable();
      renderChartPreview();
    }
  };

  document.getElementById("pasteCsvBtn").onclick = handleCsvPaste;
  document.getElementById("csvFileInput").onchange = handleFileUpload;
}

function renderDataTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";
  const currentList = SalahApp.monthsData[SalahApp.currentMonthIndex] || [];

  currentList.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" value="${row.day}" style="width:45px; text-align:center;" onchange="updateCell(${index}, 'day', this.value)"></td>
      <td><input type="text" value="${row.fajr}" style="width:65px;" onchange="updateCell(${index}, 'fajr', this.value)"></td>
      <td><input type="text" value="${row.sunrise}" style="width:65px;" onchange="updateCell(${index}, 'sunrise', this.value)"></td>
      <td><input type="text" value="${row.zuhr}" style="width:65px;" onchange="updateCell(${index}, 'zuhr', this.value)"></td>
      <td><input type="text" value="${row.asr}" style="width:65px;" onchange="updateCell(${index}, 'asr', this.value)"></td>
      <td><input type="text" value="${row.sunset}" style="width:65px;" onchange="updateCell(${index}, 'sunset', this.value)"></td>
      <td><input type="text" value="${row.isha}" style="width:65px;" onchange="updateCell(${index}, 'isha', this.value)"></td>
      <td style="text-align:center;">
        <button style="color:#dc2626; border:none; background:none; cursor:pointer; font-weight:bold;" onclick="deleteTableRow(${index})">✖</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateCell(index, key, value) {
  const list = SalahApp.monthsData[SalahApp.currentMonthIndex];
  if (list && list[index]) {
    list[index][key] = value.trim();
    renderChartPreview();
  }
}

function deleteTableRow(index) {
  const list = SalahApp.monthsData[SalahApp.currentMonthIndex];
  if (list) {
    list.splice(index, 1);
    renderDataTable();
    renderChartPreview();
  }
}

function parseCsvContent(text) {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return;

  const parsed = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(/[\t,;]+/).map(c => c.trim().replace(/^["']|["']$/g, ""));
    if (i === 0 && (isNaN(parseInt(cols[0], 10)) || cols[1]?.toLowerCase().includes("fajr"))) continue;
    if (cols.length >= 6) {
      parsed.push({
        day: cols[0] || (parsed.length + 1),
        fajr: cols[1] || "",
        sunrise: cols[2] || "",
        zuhr: cols[3] || "",
        asr: cols[4] || "",
        sunset: cols[5] || "",
        isha: cols[6] || ""
      });
    }
  }

  if (parsed.length > 0) {
    SalahApp.monthsData[SalahApp.currentMonthIndex] = parsed;
    renderDataTable();
    renderChartPreview();
    alert(`Successfully loaded ${parsed.length} days into ${MONTH_NAMES[SalahApp.currentMonthIndex]}.`);
  }
}

function handleCsvPaste() {
  const input = prompt("Paste your Tab or Comma-separated Salah Timetable data:");
  if (input) parseCsvContent(input);
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => parseCsvContent(event.target.result);
  reader.readAsText(file);
}

function getFilteredDays(mode) {
  const list = SalahApp.monthsData[SalahApp.currentMonthIndex] || [];
  if (list.length === 0) return [];

  switch (mode) {
    case "weekly": return list.filter(d => [7, 14, 21, 28].includes(parseInt(d.day, 10)));
    case "ten_days": return list.filter(d => { const n = parseInt(d.day, 10); return n % 3 === 0 && n <= 30; });
    case "three_days": return list.filter(d => [10, 20, 30, 31].includes(parseInt(d.day, 10)));
    case "two_days": return list.filter(d => [15, 30].includes(parseInt(d.day, 10)));
    case "complete":
    default: return list;
  }
}

function renderChartPreview() {
  const container = document.getElementById("previewContainer");
  container.innerHTML = "";

  const mode = document.getElementById("modeSelect").value;
  const filteredDays = getFilteredDays(mode);

  if (filteredDays.length === 0) {
    container.innerHTML = `<div style="background:#fff; padding:30px; border-radius:8px; font-weight:bold;">No data available. Click 'Fill Realistic 30 Days' or Paste CSV.</div>`;
    return;
  }

  const sheet = document.createElement("div");
  sheet.id = "a4PrintableSheet";
  sheet.className = `a4-sheet ${SalahApp.orientation === "landscape" ? "a4-landscape" : "a4-portrait"}`;

  const mosque = document.getElementById("inputMosque").value || "Jamia Masjid";
  const location = document.getElementById("inputLocation").value || "District, State";
  const gregDate = document.getElementById("inputGregorianDate").value || "October 2026";
  const islamicDate = document.getElementById("inputIslamicDate").value || "";

  const headerHtml = `
    <div class="print-header">
      <div class="print-title-area">
        <div class="print-mosque-name">${escapeHtml(mosque)}</div>
        <div class="print-location">${escapeHtml(location)} | Salah Waterfall Chart</div>
      </div>
      <div class="print-date-badge">
        <div class="print-month-year">${escapeHtml(gregDate)}</div>
        ${islamicDate ? `<div class="print-islamic-range">🌙 ${escapeHtml(islamicDate)}</div>` : ""}
      </div>
    </div>
  `;

  const d1 = document.getElementById("dua1").value;
  const d2 = document.getElementById("dua2").value;
  const d3 = document.getElementById("dua3").value;
  const d4 = document.getElementById("dua4").value;

  const duasHtml = `
    <div class="print-duas-grid">
      <div class="print-dua-box"><div class="print-dua-title">Dua 1 (Sehri)</div><div>${escapeHtml(d1)}</div></div>
      <div class="print-dua-box"><div class="print-dua-title">Dua 2 (Iftar)</div><div>${escapeHtml(d2)}</div></div>
      <div class="print-dua-box"><div class="print-dua-title">Dua 3 (Entering Mosque)</div><div>${escapeHtml(d3)}</div></div>
      <div class="print-dua-box"><div class="print-dua-title">Dua 4 (Reminder)</div><div>${escapeHtml(d4)}</div></div>
    </div>
  `;

  let timeScaleTicksHtml = "";
  let gridLinesHtml = "";

  for (let min = SalahApp.config.startMinutes; min <= SalahApp.config.endMinutes; min += SalahApp.config.stepMinutes) {
    const yPercent = getYPercent(min);
    const isHour = (min % 60 === 0);

    if (isHour) {
      timeScaleTicksHtml += `<div class="time-tick hour-tick" style="top: ${yPercent}%;">${minutesToTime(min)}</div>`;
      gridLinesHtml += `<div class="grid-line-15m grid-line-hour" style="top: ${yPercent}%;"></div>`;
    } else {
      timeScaleTicksHtml += `<div class="time-tick" style="top: ${yPercent}%;">${minutesToTime(min).slice(3)}</div>`;
      gridLinesHtml += `<div class="grid-line-15m" style="top: ${yPercent}%;"></div>`;
    }
  }

  let pillarsHtml = "";
  filteredDays.forEach(dayRow => {
    const fMin = timeToMinutes(dayRow.fajr);
    const srMin = timeToMinutes(dayRow.sunrise);
    const zMin = timeToMinutes(dayRow.zuhr);
    const aMin = timeToMinutes(dayRow.asr);
    const ssMin = timeToMinutes(dayRow.sunset);
    const iMin = timeToMinutes(dayRow.isha);

    let ribbonHtml = "";
    if (srMin !== null && ssMin !== null) {
      const topY = getYPercent(srMin);
      const bottomY = getYPercent(ssMin);
      const heightY = Math.max(2, bottomY - topY);
      ribbonHtml = `<div class="vertical-daylight-ribbon" style="top: ${topY}%; height: ${heightY}%;"></div>`;
    }

    const markers = [
      { min: fMin, text: dayRow.fajr },
      { min: srMin, text: dayRow.sunrise },
      { min: zMin, text: dayRow.zuhr },
      { min: aMin, text: dayRow.asr },
      { min: ssMin, text: dayRow.sunset },
      { min: iMin, text: dayRow.isha }
    ];

    let markersHtml = "";
    markers.forEach(m => {
      if (m.min !== null && m.text) {
        markersHtml += `
          <div class="salah-marker" style="top: ${getYPercent(m.min)}%;">
            <div class="marker-pin-line"></div>
            <span class="marker-time-tag">${m.text}</span>
          </div>
        `;
      }
    });

    const dayLength = calculateDayLength(dayRow.sunrise, dayRow.sunset);

    pillarsHtml += `
      <div class="day-column">
        <div class="day-col-header">D${dayRow.day}</div>
        <div class="day-col-body">
          ${ribbonHtml}
          ${markersHtml}
        </div>
        ${dayLength ? `<div class="day-length-tag">☀️ ${dayLength}</div>` : ""}
      </div>
    `;
  });

  let ruledLinesHtml = "";
  const linesCount = SalahApp.orientation === "landscape" ? 18 : 28;
  for (let i = 0; i < linesCount; i++) {
    ruledLinesHtml += `<div class="notes-line"></div>`;
  }

  sheet.innerHTML = `
    ${headerHtml}
    ${duasHtml}
    <div class="chart-layout-wrapper">
      <div class="time-scale-col">${timeScaleTicksHtml}</div>
      <div class="chart-pillars-container">
        <div class="grid-lines-overlay">${gridLinesHtml}</div>
        ${pillarsHtml}
      </div>
      <div class="print-notes-strip">
        <div class="notes-title">Notes / Announce</div>
        <div class="notes-ruled-lines">${ruledLinesHtml}</div>
      </div>
    </div>
    <div class="print-footer">
      <span>* Scale: 03:00 to 21:00 (15m grid). Yellow bar: Daylight. Bottom: Day length.</span>
      <span class="print-order-email">📧 To Order mail:- mustafa2smi@gmail.com</span>
    </div>
  `;

  container.appendChild(sheet);
}

function downloadA4Pdf() {
  const element = document.getElementById("a4PrintableSheet");
  if (!element) return;

  const opt = {
    margin: 0,
    filename: `Salah_Time_Chart_${MONTH_NAMES[SalahApp.currentMonthIndex]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: SalahApp.orientation }
  };

  html2pdf().set(opt).from(element).save();
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
