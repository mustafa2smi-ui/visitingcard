/**
 * Salah.js - Smart Multi-Page Waterfall Engine
 */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const SalahApp = {
  currentMonthIndex: 9, // October
  monthsData: {},
  orientation: "portrait",
  config: {
    startMinutes: 3 * 60,       // 03:00 AM = 180 min
    endMinutes: 21 * 60,         // 21:00 (09:00 PM) = 1260 min
    totalMinutes: (21 - 3) * 60, // 1080 min
    stepMinutes: 15              // 15-minute grid lines
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
  const seasonalShift = Math.sin((monthIndex / 12) * Math.PI * 2) * 45;

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

function parseTimeToMinutes(timeStr, prayerType = "") {
  if (!timeStr) return null;
  const s = String(timeStr).trim().toLowerCase();
  const isPM = s.includes("pm");
  const isAM = s.includes("am");
  const clean = s.replace(/am|pm/g, "").trim();
  const parts = clean.split(":");
  if (parts.length < 2) return null;

  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);

  if (isNaN(h) || isNaN(m)) return null;
  if (m < 0 || m >= 60) return null;
  if (h < 0 || h > 23) return null;

  if (["asr", "sunset", "maghrib", "isha"].includes(prayerType)) {
    if (h < 12 && !isAM) h += 12;
  } else if (prayerType === "zuhr") {
    if (h >= 1 && h <= 5 && !isAM) h += 12;
  } else if (isPM && h < 12) {
    h += 12;
  } else if (isAM && h === 12) {
    h = 0;
  }

  return h * 60 + m;
}

function isValidTimeString(timeStr) {
  if (!timeStr) return true;
  const clean = String(timeStr).trim().toLowerCase().replace(/am|pm/g, "").trim();
  const parts = clean.split(":");
  if (parts.length < 2) return false;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return false;
  if (m < 0 || m > 59) return false;
  if (h < 0 || h > 23) return false;
  return true;
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

function calculateDayLength(srStr, ssStr) {
  const srMin = parseTimeToMinutes(srStr, "sunrise");
  const ssMin = parseTimeToMinutes(ssStr, "sunset");
  if (srMin === null || ssMin === null || ssMin <= srMin) return "";
  const diff = ssMin - srMin;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

function initUIListeners() {
  document.getElementById("printBtn").onclick = () => window.print();
  document.getElementById("downloadPdfBtn").onclick = downloadMultiPagePdf;

  document.getElementById("orientationSelect").onchange = (e) => {
    SalahApp.orientation = e.target.value;
    renderChartPreview();
  };

  document.getElementById("modeSelect").onchange = () => renderChartPreview();

  const liveInputs = [
    "inputMosque", "inputLocation", "inputGregorianDate", "inputIslamicDate1", "inputIslamicDate2",
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

  const modal = document.getElementById("smartPasteModal");
  document.getElementById("openPasteModalBtn").onclick = () => {
    document.getElementById("smartPasteTextarea").value = "";
    modal.classList.add("active");
  };
  const closeModal = () => modal.classList.remove("active");
  document.getElementById("closePasteModalBtn").onclick = closeModal;
  document.getElementById("cancelPasteModalBtn").onclick = closeModal;
  document.getElementById("applySmartPasteBtn").onclick = handleSmartPasteSubmit;

  document.getElementById("csvFileInput").onchange = handleFileUpload;
}

function handleSmartPasteSubmit() {
  const rawText = document.getElementById("smartPasteTextarea").value.trim();
  if (!rawText) {
    alert("Kripya pehle text area me data paste karein!");
    return;
  }

  const autoPM = document.getElementById("chkAutoConvertPM").checked;

  const timeRegex = /(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi;
  const matches = [];
  let m;
  while ((m = timeRegex.exec(rawText)) !== null) {
    matches.push({
      time: m[1].trim(),
      start: m.index,
      end: m.index + m[0].length
    });
  }

  if (matches.length < 6) {
    alert("Kripya check karein ki data me kam se kam ek din ke 6 salah times maujood hain.");
    return;
  }

  const parsedList = [];

  for (let i = 0; i < matches.length; i += 6) {
    const group = matches.slice(i, i + 6);
    if (group.length < 6) break;

    const times = group.map(g => g.time);
    const firstTimeStart = group[0].start;

    let prefix = "";
    if (i === 0) {
      prefix = rawText.substring(0, firstTimeStart);
    } else {
      const prevEnd = matches[i - 1].end;
      prefix = rawText.substring(prevEnd, firstTimeStart);
    }

    prefix = prefix.trim();
    let dayNum = parsedList.length + 1;

    const numbersInPrefix = prefix.match(/\b([0-9]{1,2})\b/g);
    if (numbersInPrefix && numbersInPrefix.length > 0) {
      dayNum = parseInt(numbersInPrefix[numbersInPrefix.length - 1], 10);
    } else {
      const attached = prefix.match(/([0-9]{1,2})/g);
      if (attached && attached.length > 0) {
        dayNum = parseInt(attached[attached.length - 1], 10);
      }
    }

    parsedList.push({
      day: dayNum,
      fajr: sanitizePastedTime(times[0], "fajr", autoPM),
      sunrise: sanitizePastedTime(times[1], "sunrise", autoPM),
      zuhr: sanitizePastedTime(times[2], "zuhr", autoPM),
      asr: sanitizePastedTime(times[3], "asr", autoPM),
      sunset: sanitizePastedTime(times[4], "sunset", autoPM),
      isha: sanitizePastedTime(times[5], "isha", autoPM)
    });
  }

  if (parsedList.length > 0) {
    SalahApp.monthsData[SalahApp.currentMonthIndex] = parsedList;
    renderDataTable();
    renderChartPreview();
    document.getElementById("smartPasteModal").classList.remove("active");
    alert(`Alhamdulillah! ${parsedList.length} dino ka data import ho gaya.`);
  } else {
    alert("Data parse nahi ho saka.");
  }
}

function sanitizePastedTime(timeToken, prayerType, autoPM) {
  if (!timeToken) return "";
  const min = parseTimeToMinutes(timeToken, autoPM ? prayerType : "");
  if (min === null) return timeToken;
  return minutesToTime(min);
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    document.getElementById("smartPasteTextarea").value = event.target.result;
    document.getElementById("smartPasteModal").classList.add("active");
  };
  reader.readAsText(file);
}

function renderDataTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";
  const currentList = SalahApp.monthsData[SalahApp.currentMonthIndex] || [];

  currentList.forEach((row, index) => {
    const tr = document.createElement("tr");

    const fValid = isValidTimeString(row.fajr);
    const srValid = isValidTimeString(row.sunrise);
    const zValid = isValidTimeString(row.zuhr);
    const aValid = isValidTimeString(row.asr);
    const ssValid = isValidTimeString(row.sunset);
    const iValid = isValidTimeString(row.isha);

    tr.innerHTML = `
      <td><input type="text" value="${row.day}" style="width:45px; text-align:center;" oninput="updateCell(${index}, 'day', this.value, this)"></td>
      <td><input type="text" value="${row.fajr}" class="${fValid ? '' : 'invalid-cell'}" style="width:65px;" oninput="updateCell(${index}, 'fajr', this.value, this)"></td>
      <td><input type="text" value="${row.sunrise}" class="${srValid ? '' : 'invalid-cell'}" style="width:65px;" oninput="updateCell(${index}, 'sunrise', this.value, this)"></td>
      <td><input type="text" value="${row.zuhr}" class="${zValid ? '' : 'invalid-cell'}" style="width:65px;" oninput="updateCell(${index}, 'zuhr', this.value, this)"></td>
      <td><input type="text" value="${row.asr}" class="${aValid ? '' : 'invalid-cell'}" style="width:65px;" oninput="updateCell(${index}, 'asr', this.value, this)"></td>
      <td><input type="text" value="${row.sunset}" class="${ssValid ? '' : 'invalid-cell'}" style="width:65px;" oninput="updateCell(${index}, 'sunset', this.value, this)"></td>
      <td><input type="text" value="${row.isha}" class="${iValid ? '' : 'invalid-cell'}" style="width:65px;" oninput="updateCell(${index}, 'isha', this.value, this)"></td>
      <td style="text-align:center;">
        <button style="color:#dc2626; border:none; background:none; cursor:pointer; font-weight:bold;" onclick="deleteTableRow(${index})">✖</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateCell(index, key, value, inputEl) {
  const list = SalahApp.monthsData[SalahApp.currentMonthIndex];
  if (list && list[index]) {
    list[index][key] = value.trim();

    if (key !== "day") {
      const valid = isValidTimeString(value);
      if (inputEl) {
        inputEl.classList.toggle("invalid-cell", !valid);
      }
    }
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

function getPagesData(mode) {
  if (mode === "weekly_all_year") {
    const page1 = [];
    const page2 = [];

    for (let m = 0; m < 12; m++) {
      const monthList = SalahApp.monthsData[m] || [];
      const fourDays = monthList.filter(d => [7, 14, 21, 28].includes(parseInt(d.day, 10)));
      fourDays.forEach((d, idx) => {
        const item = { ...d, monthLabel: MONTH_SHORT[m], isFirstOfMonth: idx === 0 };
        if (m < 6) {
          page1.push(item);
        } else {
          page2.push(item);
        }
      });
    }

    return [
      { pageTitle: "PART 1: JAN - JUN", pillars: page1, pageNum: 1, totalPages: 2 },
      { pageTitle: "PART 2: JUL - DEC", pillars: page2, pageNum: 2, totalPages: 2 }
    ];
  }

  if (mode === "two_days_all_year") {
    const page = [];
    for (let m = 0; m < 12; m++) {
      const monthList = SalahApp.monthsData[m] || [];
      const twoDays = monthList.filter(d => [15, 30].includes(parseInt(d.day, 10)));
      twoDays.forEach((d, idx) => {
        page.push({
          ...d,
          monthLabel: MONTH_SHORT[m],
          isFirstOfMonth: idx === 0
        });
      });
    }
    return [{ pageTitle: "FULL YEAR (15 & 30 OF EACH MONTH)", pillars: page, pageNum: 1, totalPages: 1 }];
  }

  const curList = SalahApp.monthsData[SalahApp.currentMonthIndex] || [];
  let currentPillars = [];

  if (mode === "ten_days_current") {
    currentPillars = curList.filter(d => {
      const n = parseInt(d.day, 10);
      return n % 3 === 0 && n <= 30;
    }).map(d => ({ ...d, monthLabel: "" }));
  } else if (mode === "three_days_current") {
    currentPillars = curList.filter(d => [10, 20, 30, 31].includes(parseInt(d.day, 10)))
                            .map(d => ({ ...d, monthLabel: "" }));
  } else {
    currentPillars = curList.map(d => ({ ...d, monthLabel: "" }));
  }

  return [{ pageTitle: "", pillars: currentPillars, pageNum: 1, totalPages: 1 }];
}

function renderChartPreview() {
  const container = document.getElementById("previewContainer");
  container.innerHTML = "";

  const mode = document.getElementById("modeSelect").value;
  const pagesList = getPagesData(mode);

  if (!pagesList || pagesList.length === 0 || pagesList[0].pillars.length === 0) {
    container.innerHTML = `<div style="background:#fff; padding:30px; border-radius:8px; font-weight:bold;">No data available. Fill data for month.</div>`;
    return;
  }

  const mosque = document.getElementById("inputMosque").value || "Jamia Masjid";
  const location = document.getElementById("inputLocation").value || "District, State";
  const gregDate = document.getElementById("inputGregorianDate").value || "October 2026";
  const islamic1 = document.getElementById("inputIslamicDate1").value || "";
  const islamic2 = document.getElementById("inputIslamicDate2").value || "";

  const d1 = document.getElementById("dua1").value;
  const d2 = document.getElementById("dua2").value;
  const d3 = document.getElementById("dua3").value;
  const d4 = document.getElementById("dua4").value;

  const isSingleMonthMode = (mode === "complete" || mode === "ten_days_current" || mode === "three_days_current");

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

  pagesList.forEach((pageObj) => {
    const sheet = document.createElement("div");
    sheet.className = `a4-sheet a4-page-node ${SalahApp.orientation === "landscape" ? "a4-landscape" : "a4-portrait"}`;

    const islamicHtml = `
      <div class="print-islamic-container">
        ${islamic1 ? `<div class="print-islamic-pill">🌙 ${escapeHtml(islamic1)}</div>` : ""}
        ${islamic2 ? `<div class="print-islamic-pill">🌙 ${escapeHtml(islamic2)}</div>` : ""}
      </div>
    `;

    const titleText = isSingleMonthMode 
      ? escapeHtml(gregDate) 
      : (pageObj.pageTitle || "FULL YEAR SCHEDULE");

    const headerHtml = `
      <div class="print-header">
        <div class="print-title-area">
          <div class="print-mosque-name">${escapeHtml(mosque)}</div>
          <div class="print-location">${escapeHtml(location)} | Salah Waterfall Chart</div>
        </div>
        <div class="print-date-badge">
          <div class="print-month-year">${titleText}</div>
          ${islamicHtml}
        </div>
      </div>
    `;

    const duasHtml = `
      <div class="print-duas-grid">
        <div class="print-dua-box"><div class="print-dua-title">Dua 1 (Sehri)</div><div>${escapeHtml(d1)}</div></div>
        <div class="print-dua-box"><div class="print-dua-title">Dua 2 (Iftar)</div><div>${escapeHtml(d2)}</div></div>
        <div class="print-dua-box"><div class="print-dua-title">Dua 3 (Entering Mosque)</div><div>${escapeHtml(d3)}</div></div>
        <div class="print-dua-box"><div class="print-dua-title">Dua 4 (Reminder)</div><div>${escapeHtml(d4)}</div></div>
      </div>
    `;

    let pillarsHtml = "";
    pageObj.pillars.forEach(dayRow => {
      const fMin = parseTimeToMinutes(dayRow.fajr, "fajr");
      const srMin = parseTimeToMinutes(dayRow.sunrise, "sunrise");
      const zMin = parseTimeToMinutes(dayRow.zuhr, "zuhr");
      const aMin = parseTimeToMinutes(dayRow.asr, "asr");
      const ssMin = parseTimeToMinutes(dayRow.sunset, "sunset");
      const iMin = parseTimeToMinutes(dayRow.isha, "isha");

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
          const yPos = getYPercent(m.min);
          markersHtml += `
            <div class="salah-marker" style="top: ${yPos}%;">
              <div class="marker-pin-line"></div>
              <span class="marker-time-tag">${m.text}</span>
            </div>
          `;
        }
      });

      const dayLength = calculateDayLength(dayRow.sunrise, dayRow.sunset);
      const boundaryClass = dayRow.isFirstOfMonth ? "month-group-boundary" : "";

      pillarsHtml += `
        <div class="day-column ${boundaryClass}">
          <div class="day-col-header">
            ${dayRow.monthLabel ? `<span class="month-sub-tag">${dayRow.monthLabel}</span>` : ""}
            D${dayRow.day}
          </div>
          <div class="day-col-body">
            ${ribbonHtml}
            ${markersHtml}
          </div>
          ${dayLength ? `<div class="day-length-tag">☀️ ${dayLength}</div>` : `<div class="day-length-tag"></div>`}
        </div>
      `;
    });

    const pageBadge = pageObj.totalPages > 1 
      ? `<div class="page-badge-counter">PAGE ${pageObj.pageNum} OF ${pageObj.totalPages}</div>` 
      : "";

    sheet.innerHTML = `
      ${pageBadge}
      ${headerHtml}
      ${duasHtml}
      <div class="chart-layout-wrapper">
        <div class="time-scale-col">
          <div class="time-scale-header">TIME</div>
          <div class="time-scale-body">${timeScaleTicksHtml}</div>
          <div class="time-scale-footer">DIFF</div>
        </div>
        <div class="chart-pillars-container">
          <div class="grid-lines-overlay">${gridLinesHtml}</div>
          ${pillarsHtml}
        </div>
      </div>
      <div class="print-footer">
        <span>* Precision Sub-minute Scale (03:00-21:00). Yellow bar: Daylight. Bottom: Day Length.</span>
        <span class="print-order-email">📧 To Order mail:- mustafa2smi@gmail.com</span>
      </div>
    `;

    container.appendChild(sheet);
  });
}

async function downloadMultiPagePdf() {
  const pageNodes = document.querySelectorAll(".a4-page-node");
  if (!pageNodes || pageNodes.length === 0) {
    alert("Kripya preview load hone ka intezar karein.");
    return;
  }

  const btn = document.getElementById("downloadPdfBtn");
  const origText = btn.innerHTML;
  btn.innerHTML = `⏳ PDF Exporting (${pageNodes.length} Pages)...`;
  btn.disabled = true;

  try {
    const isLandscape = (SalahApp.orientation === "landscape");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;

    for (let i = 0; i < pageNodes.length; i++) {
      const node = pageNodes[i];

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      if (i > 0) {
        pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`Salah_Time_Chart_${MONTH_NAMES[SalahApp.currentMonthIndex]}.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Notice: Direct download me masla aaya, browser print window open ho rahi hai, wahan 'Save as PDF' chunein.");
    window.print();
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
