/**
 * Dua.js - Dedicated Engine for Masnoon Dua Companion Sheet
 */

const DUA_PRESETS = [
  {
    title: "1. Sehri Ki Dua (Roza Rakhne Ki Niyyat)",
    arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
    transliteration: "Wa bisawmi ghadin nawaytu min shahri Ramadan.",
    translation: "Aur maine Ramadan ke kal ke roze ki niyat ki."
  },
  {
    title: "2. Iftar Ke Waqt Ki Dua",
    arabic: "اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
    transliteration: "Allahumma inni laka sumtu wa bika aamantu wa 'alayka tawakkaltu wa 'ala rizqika aftartu.",
    translation: "Aye Allah! Maine tere liye roza rakha, aur tujh par imaan laya, aur tere diye rizq se iftar kiya."
  },
  {
    title: "3. Masjid Me Dakhil Hone Ki Dua",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahummaftah li abwaba rahmatik.",
    translation: "Aye Allah! Mere liye apni rahmat ke darwaze khol de."
  },
  {
    title: "4. Masjid Se Nikalne Ki Dua",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allahumma inni as-aluka min fadlik.",
    translation: "Aye Allah! Beshak main tujh se tera fazl talab karta hoon."
  },
  {
    title: "5. Sone Se Pehle Ki Dua",
    arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
    transliteration: "Allahumma bismika amootu wa ahyaa.",
    translation: "Aye Allah! Main tere naam ke sath hi marta (sota) hoon aur jeeta (jaagta) hoon."
  },
  {
    title: "6. Neend Se Jaagne Ke Baad Ki Dua",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdulillahi-llathee ahyana ba'da ma amatana wa ilayhin-nushoor.",
    translation: "Tamaam tareefein Allah ke liye hain jisne hume maut (neend) ke baad zindagi bakhshi aur usi ki taraf lautna hai."
  },
  {
    title: "7. Ghar Se Nikalne Ki Dua",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillahi tawakkaltu 'alallahi, la hawla wa la quwwata illa billah.",
    translation: "Allah ke naam se, maine Allah par bharosa kiya, burai se bachne aur neki karne ki taaqat sirf Allah ki madad se hai."
  },
  {
    title: "8. Har Mushkil Aur Museebat Se Hifazat Ki Dua",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ",
    transliteration: "Hasbunallahu wa ni'mal wakeel, ni'mal mawla wa ni'man naseer.",
    translation: "Hume Allah kafi hai aur wo behtareen kaarsaaz hai, behtareen maalik aur behtareen madadgaar hai."
  }
];

const DuaApp = {
  cardCount: 4,
  orientation: "portrait",
  duas: []
};

document.addEventListener("DOMContentLoaded", () => {
  DuaApp.duas = JSON.parse(JSON.stringify(DUA_PRESETS));
  initUIListeners();
  renderEditorInputs();
  renderDuaPreview();
});

function initUIListeners() {
  document.getElementById("cardCountSelect").onchange = (e) => {
    DuaApp.cardCount = parseInt(e.target.value, 10);
    renderEditorInputs();
    renderDuaPreview();
  };

  document.getElementById("orientationSelect").onchange = (e) => {
    DuaApp.orientation = e.target.value;
    renderDuaPreview();
  };

  const headerInputs = ["inputDuaMosque", "inputDuaTitle", "inputDuaEmail"];
  headerInputs.forEach(id => {
    document.getElementById(id).addEventListener("input", renderDuaPreview);
  });

  document.getElementById("loadDuaPresetsBtn").onclick = () => {
    DuaApp.duas = JSON.parse(JSON.stringify(DUA_PRESETS));
    renderEditorInputs();
    renderDuaPreview();
  };

  document.getElementById("clearDuasBtn").onclick = () => {
    if (confirm("Kya aap saari duayein clear karna chahte hain?")) {
      DuaApp.duas.forEach(d => {
        d.arabic = "";
        d.transliteration = "";
        d.translation = "";
      });
      renderEditorInputs();
      renderDuaPreview();
    }
  };

  document.getElementById("printDuaBtn").onclick = () => window.print();
  document.getElementById("downloadDuaPdfBtn").onclick = downloadDuaPdf;
}

function renderEditorInputs() {
  const container = document.getElementById("duaEditorContainer");
  container.innerHTML = "";

  for (let i = 0; i < DuaApp.cardCount; i++) {
    const dua = DuaApp.duas[i] || { title: `Dua ${i+1}`, arabic: "", transliteration: "", translation: "" };
    
    const div = document.createElement("div");
    div.className = "dua-edit-card";
    div.innerHTML = `
      <div class="dua-edit-header">
        <span>CARD #${i + 1}</span>
        <input type="text" value="${escapeHtml(dua.title)}" style="width:70%; font-weight:bold;" oninput="updateDua(${i}, 'title', this.value)">
      </div>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:8px;">
        <div class="form-group">
          <label>Arabic Matn (عربی متن):</label>
          <input type="text" class="arabic-input" value="${escapeHtml(dua.arabic)}" oninput="updateDua(${i}, 'arabic', this.value)">
        </div>
        <div class="form-group">
          <label>Transliteration (Roman Urdu):</label>
          <input type="text" value="${escapeHtml(dua.transliteration)}" oninput="updateDua(${i}, 'transliteration', this.value)">
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label>Tarjuma (Urdu / Hindi Meaning):</label>
          <input type="text" value="${escapeHtml(dua.translation)}" oninput="updateDua(${i}, 'translation', this.value)">
        </div>
      </div>
    `;
    container.appendChild(div);
  }
}

function updateDua(index, field, value) {
  if (!DuaApp.duas[index]) {
    DuaApp.duas[index] = { title: "", arabic: "", transliteration: "", translation: "" };
  }
  DuaApp.duas[index][field] = value;
  renderDuaPreview();
}

function renderDuaPreview() {
  const container = document.getElementById("previewContainer");
  container.innerHTML = "";

  const sheet = document.createElement("div");
  sheet.id = "a4DuaPrintableSheet";
  sheet.className = `a4-sheet ${DuaApp.orientation === "landscape" ? "a4-landscape" : "a4-portrait"}`;

  const mosque = document.getElementById("inputDuaMosque").value || "Jamia Masjid";
  const title = document.getElementById("inputDuaTitle").value || "Daily Masnoon Duain & Azkaar";
  const email = document.getElementById("inputDuaEmail").value || "mustafa2smi@gmail.com";

  let cardsHtml = "";
  for (let i = 0; i < DuaApp.cardCount; i++) {
    const d = DuaApp.duas[i] || { title: `Dua ${i+1}`, arabic: "", transliteration: "", translation: "" };

    cardsHtml += `
      <div class="printed-dua-card">
        <div class="card-top-title">
          <span>${escapeHtml(d.title)}</span>
          <span class="badge">#${i + 1}</span>
        </div>
        ${d.arabic ? `<div class="arabic-content">${escapeHtml(d.arabic)}</div>` : ""}
        ${d.transliteration ? `<div class="transliteration-text">${escapeHtml(d.transliteration)}</div>` : ""}
        ${d.translation ? `<div class="translation-text">${escapeHtml(d.translation)}</div>` : ""}
      </div>
    `;
  }

  sheet.innerHTML = `
    <div class="sheet-islamic-border">
      <div class="corner-ornament top-left"></div>
      <div class="corner-ornament top-right"></div>
      <div class="corner-ornament bottom-left"></div>
      <div class="corner-ornament bottom-right"></div>

      <div class="sheet-header">
        <div class="bismillah-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <div class="sheet-title">${escapeHtml(title)}</div>
        <div class="sheet-subtitle">${escapeHtml(mosque)} | Masnoon Azkaar Companion</div>
      </div>

      <div class="dua-grid-container grid-layout-${DuaApp.cardCount}">
        ${cardsHtml}
      </div>

      <div class="sheet-footer">
        <span>* Tilawat aur Duaon ki pabandi barkat aur hifazat ka zariya hai.</span>
        <span>📧 To Order Customized Charts: ${escapeHtml(email)}</span>
      </div>
    </div>
  `;

  container.appendChild(sheet);
}

async function downloadDuaPdf() {
  const element = document.getElementById("a4DuaPrintableSheet");
  if (!element) {
    alert("Kripya preview load hone ka intezar karein.");
    return;
  }

  const btn = document.getElementById("downloadDuaPdfBtn");
  const origText = btn.innerHTML;
  btn.innerHTML = "⏳ PDF Exporting...";
  btn.disabled = true;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const isLandscape = (DuaApp.orientation === "landscape");
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Masnoon_Dua_Sheet_A4.pdf`);
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
