/**
 * Salah.js - Main Application Logic for Vertical Ribbon Salah Time Chart
 */

const SalahApp = {
  data: [],
  config: {
    startMinutes: 3 * 60,       // 03:00 AM = 180 min
    endMinutes: 21 * 60,         // 21:00 (09:00 PM) = 1260 min
    totalMinutes: (21 - 3) * 60, // 1080 min
    stepMinutes: 15              // 15-minute scale grid
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initUIListeners();
  generateDefaultSampleData();
  renderDataTable();
  renderChartPreview();
});

function initUIListeners() {
  const drawer = document.getElementById("sideDrawer");
  const overlay = document.getElementById("drawerOverlay");
  document.getElementById("openDrawerBtn").onclick = () => {
    drawer.classList.add("active");
    overlay.classList.add("active");
  };
  const closeDrawer = () => {
    drawer.classList.remove("active");
    overlay.classList.remove("active");
  };
  document.getElementById("closeDrawerBtn").onclick = closeDrawer;
  overlay.onclick = closeDrawer;

  document.getElementById("printBtn").onclick = () => window.print();
  document.getElementById("modeSelect").onchange = () => renderChartPreview();

  const liveInputs = [
    "inputMosque", "inputDistrict", "inputState",
    "dua1", "dua2", "dua3", "dua4",
    "labelFajr", "labelSunrise", "labelZuhr", "labelAsr", "labelMaghrib", "labelIsha"
  ];
  liveInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => renderChartPreview());
  });

  document.getElementById("loadSampleBtn").onclick = () => {
    generateDefaultSampleData();
    renderDataTable();
    renderChartPreview();
  };

  document.getElementById("clearDataBtn").onclick = () => {
    if (confirm("Are you sure you want to clear the timetable?")) {
      SalahApp.data = [];
      renderDataTable();
      renderChartPreview();
    }
  };

  document.getElementById("pasteCsvBtn").onclick = handleCsvPaste;
  document.getElementById("csvFileInput").onchange = handleFileUpload;
}

function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const clean = timeStr.trim().split(" ")[0];
  const parts = clean.split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function minutesToTime(totalMin) {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function getYPercent(minutes) {
  if (minutes === null || minutes === undefined) return 0;
  const clamped = Math.max(SalahApp.config.startMinutes, Math.min(SalahApp.config.endMinutes, minutes));
  return ((clamped - SalahApp.config.startMinutes) / SalahApp.config.totalMinutes) * 100;
}

function generateDefaultSampleData() {
  SalahApp.data = [];
  for (let day = 1; day <= 30; day++) {
    const fajrMin = (4 * 60 + 15) - Math.floor(day * 0.7);
    const sunriseMin = (5 * 60 + 35) - Math.floor(day * 0.8);
    const zuhrMin = 12 * 60 + 15;
    const asrMin = (15 * 60 + 45) + Math.floor(day * 0.4);
    const sunsetMin = (18 * 60 + 35) + Math.floor(day * 0.7);
    const ishaMin = (19 * 60 + 55) + Math.floor(day * 0.7);

    SalahApp.data.push({
      day: day,
      fajr: minutesToTime(fajrMin),
      sunrise: minutesToTime(sunriseMin),
      zuhr: minutesToTime(zuhrMin),
      asr: minutesToTime(asrMin),
      sunset: minutesToTime(sunsetMin),
      isha: minutesToTime(ishaMin)
    });
  }
}

function renderDataTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  SalahApp.data.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" value="${row.day}" style="width:50px; text-align:center;" onchange="updateCell(${index}, 'day', this.value)"></td>
      <td><input type="text" value="${row.fajr}" style="width:70px;" onchange="updateCell(${index}, 'fajr', this.value)"></td>
      <td><input type="text" value="${row.sunrise}" style="width:70px;" onchange="updateCell(${index}, 'sunrise', this.value)"></td>
      <td><input type="text" value="${row.zuhr}" style="width:70px;" onchange="updateCell(${index}, 'zuhr', this.value)"></td>
      <td><input type="text" value="${row.asr}" style="width:70px;" onchange="updateCell(${index}, 'asr', this.value)"></td>
      <td><input type="text" value="${row.sunset}" style="width:70px;" onchange="updateCell(${index}, 'sunset', this.value)"></td>
      <td><input type="text" value="${row.isha}" style="width:70px;" onchange="updateCell(${index}, 'isha', this.value)"></td>
      <td style="text-align:center;">
        <button class="delete-row-btn" onclick="deleteTableRow(${index})" title="Delete row">✖</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateCell(index, key, value) {
  if (SalahApp.data[index]) {
    SalahApp.data[index][key] = value.trim();
    renderChartPreview();
  }
}

function deleteTableRow(index) {
  SalahApp.data.splice(index, 1);
  renderDataTable();
  renderChartPreview();
}

function parseCsvContent(text) {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return;

  const parsed = [];
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(/[\t,;]+/).map(c => c.trim().replace(/^["']|["']$/g, ""));
    if (i === 0 && (isNaN(parseInt(cols[0], 10)) || cols[1]?.toLowerCase().includes("fajr"))) {
      continue;
    }
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
    SalahApp.data = parsed;
    renderDataTable();
    renderChartPreview();
    alert(`Successfully imported ${parsed.length} days of Salah data.`);
  } else {
    alert("Invalid data. Ensure format: Day, Fajr, Sunrise, Zuhr, Asr, Sunset, Isha");
  }
}

function handleCsvPaste() {
  const input = prompt("Paste your Tab-separated or Comma-separated Salah Timetable data here:");
  if (input) parseCsvContent(input);
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => parseCsvContent(event.target.result);
  reader.readAsText(file);
}

function filterDataByMode(mode) {
  const total = SalahApp.data.length;
  if (total === 0) return [];

  switch (mode) {
    case "weekly": // Mode I: 7, 14, 21, 28
      return SalahApp.data.filter(d => [7, 14, 21, 28].includes(parseInt(d.day, 10)));
    case "ten_days": // Mode II: 3, 6, 9... 30
      return SalahApp.data.filter(d => {
        const n = parseInt(d.day, 10);
        return n % 3 === 0 && n <= 30;
      });
    case "three_days": // Mode III: 10, 20, 30
      return SalahApp.data.filter(d => [10, 20, 30, 31].includes(parseInt(d.day, 10)));
    case "two_days": // Mode IV: 15, 30
      return SalahApp.data.filter(d => [15, 30].includes(parseInt(d.day, 10)));
    case "complete": // Mode V: All 30/31 days
    default:
      return SalahApp.data;
  }
}

function renderChartPreview() {
  const container = document.getElementById("previewContainer");
  container.innerHTML = "";

  const mode = document.getElementById("modeSelect").value;
  const filteredDays = filterDataByMode(mode);

  if (filteredDays.length === 0) {
    container.innerHTML = `<div style="background:#fff; padding:40px; border-radius:8px;">No Salah data available.</div>`;
    return;
  }

  const sheet = document.createElement("div");
  sheet.className = "a4-sheet";

  const mosque = document.getElementById("inputMosque").value || "Jamia Mosque";
  const district = document.getElementById("inputDistrict").value || "";
  const state = document.getElementById("inputState").value || "";
  const locationLine = [district, state].filter(Boolean).join(", ");

  const headerHtml = `
    <div class="print-header">
      <div class="print-mosque-name">${escapeHtml(mosque)}</div>
      <div class="print-meta">${escapeHtml(locationLine)} | Salah Timetable Schedule | A4 Vector Waterfall</div>
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
      timeScaleTicksHtml += `
        <div class="time-tick hour-tick" style="top: ${yPercent}%;">
          ${minutesToTime(min)}
        </div>
      `;
      gridLinesHtml += `<div class="grid-line-15m grid-line-hour" style="top: ${yPercent}%;"></div>`;
    } else {
      timeScaleTicksHtml += `
        <div class="time-tick" style="top: ${yPercent}%;">
          ${minutesToTime(min).slice(3)}
        </div>
      `;
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
      ribbonHtml = `
        <div class="vertical-daylight-ribbon" 
             style="top: ${topY}%; height: ${heightY}%;" 
             title="Daylight: ${dayRow.sunrise} - ${dayRow.sunset}">
        </div>
      `;
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
        const yPos = getYPercent(m.min);
        markersHtml += `
          <div class="salah-marker" style="top: ${yPos}%;">
            <div class="marker-pin-line"></div>
            <span class="marker-time-tag">${m.text}</span>
          </div>
        `;
      }
    });

    pillarsHtml += `
      <div class="day-column">
        <div class="day-col-header">D${dayRow.day}</div>
        <div class="day-col-body">
          ${ribbonHtml}
          ${markersHtml}
        </div>
      </div>
    `;
  });

  let ruledLinesHtml = "";
  for (let i = 0; i < 28; i++) {
    ruledLinesHtml += `<div class="notes-line"></div>`;
  }

  sheet.innerHTML = `
    ${headerHtml}
    ${duasHtml}
    <div class="chart-layout-wrapper">
      <div class="time-scale-col">
        ${timeScaleTicksHtml}
      </div>
      <div class="chart-pillars-container">
        <div class="grid-lines-overlay">${gridLinesHtml}</div>
        ${pillarsHtml}
      </div>
      <div class="print-notes-strip">
        <div class="notes-title">Notes / Announce</div>
        <div class="notes-ruled-lines">
          ${ruledLinesHtml}
        </div>
      </div>
    </div>
    <div class="print-footer">
      <span>* Faint horizontal lines indicate 15-minute scale intervals. Daylight ribbon: Sunrise to Sunset.</span>
      <span>Approved by Mosque Management</span>
    </div>
  `;

  container.appendChild(sheet);
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}
