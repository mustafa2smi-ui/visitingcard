/**
 * Course LMS & Authentication Controller
 * Security Features: Input sanitization, Device Fingerprint Token, Status validation
 */

const CONFIG = {
  // Apna Google Apps Script Web App URL yahan daalein
  APPS_SCRIPT_API_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  STORAGE_KEY_TOKEN: "smc_device_token",
  STORAGE_KEY_EMAIL: "smc_user_email",
  STORAGE_KEY_STATUS: "smc_access_status"
};

// 300+ Topics Sample Repository (Google Sheet se fetch hone wala model)
const SAMPLE_LESSONS = [
  { id: "L001", cat: "Basics", title: "Stock Market Kya Hai?", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L002", cat: "Basics", title: "BSE aur NSE me kya antar hai?", type: "short", youtubeId: "dQw4w9WgXcQ" },
  { id: "L003", cat: "Basics", title: "Demat Account aur Trading Account kaise kaam karta hai?", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L004", cat: "Analysis", title: "Candlestick Charts ko kaise read karein?", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L005", cat: "Analysis", title: "Support aur Resistance kaise draw karein?", type: "short", youtubeId: "dQw4w9WgXcQ" },
  { id: "L006", cat: "Trading", title: "Stop Loss lagane ka sahi tarika", type: "short", youtubeId: "dQw4w9WgXcQ" },
  { id: "L007", cat: "Trading", title: "Risk Management & Position Sizing", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L008", cat: "F&O", title: "Options Trading: Call vs Put Basics", type: "long", youtubeId: "dQw4w9WgXcQ" }
];

// Utility: Input Sanitization
function sanitizeInput(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML.trim();
}

// Utility: Unique Device Fingerprint / Token
function getOrCreateDeviceToken() {
  let token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
  if (!token) {
    const raw = navigator.userAgent + screen.width + "x" + screen.height + Math.random().toString(36).substring(2);
    token = "dev_" + btoa(raw).replace(/[^a-zA-Z0-9]/g, "").substring(0, 24);
    localStorage.setItem(CONFIG.STORAGE_KEY_TOKEN, token);
  }
  return token;
}

// DOM Elements Check
document.addEventListener("DOMContentLoaded", () => {
  const deviceToken = getOrCreateDeviceToken();

  // 1. Agar index.html par hain
  if (document.getElementById("notesContainer")) {
    initIndexPage(deviceToken);
  }

  // 2. Agar course.html (player page) par hain
  if (document.getElementById("videoPlayerFrame")) {
    initPlayerPage();
  }
});

/* ---------------- INDEX PAGE LOGIC ---------------- */
function initIndexPage(deviceToken) {
  const notesContainer = document.getElementById("notesContainer");
  const lockOverlay = document.getElementById("lockOverlay");
  const emailInput = document.getElementById("userEmail");
  const authBtn = document.getElementById("authBtn");
  const statusBadge = document.getElementById("statusBadge");
  const accessNotice = document.getElementById("accessNotice");
  const sendPlanRequestBtn = document.getElementById("sendPlanRequestBtn");

  // Sticky note colors rotation
  const noteColors = ["note-c1", "note-c2", "note-c3", "note-c4", "note-c5"];

  // Sticky notes render karna
  notesContainer.innerHTML = "";
  SAMPLE_LESSONS.forEach((lesson, index) => {
    const colorClass = noteColors[index % noteColors.length];
    const note = document.createElement("div");
    note.className = `sticky-note ${colorClass}`;
    note.innerHTML = `
      <div>
        <span class="lesson-num">Lesson ${index + 1} • ${lesson.cat}</span>
        <div class="lesson-title">${lesson.title}</div>
      </div>
      <div class="note-footer">
        <span><i class="fa-solid ${lesson.type === 'short' ? 'fa-mobile-screen' : 'fa-film'}"></i> ${lesson.type}</span>
        <i class="fa-solid fa-play"></i>
      </div>
    `;

    note.addEventListener("click", () => {
      const currentStatus = localStorage.getItem(CONFIG.STORAGE_KEY_STATUS);
      if (currentStatus === "active") {
        // Active hai toh player page par redirect karein
        window.location.href = `course.html?id=${lesson.id}`;
      } else {
        alert("Aapka subscription active nahi hai. Kripya pehle access verify karein.");
      }
    });

    notesContainer.appendChild(note);
  });

  // Saved status restore check
  const savedStatus = localStorage.getItem(CONFIG.STORAGE_KEY_STATUS);
  if (savedStatus === "active") {
    unlockDashboard();
  }

  // Auth Button handler (OTP / Status check)
  authBtn.addEventListener("click", async () => {
    const email = sanitizeInput(emailInput.value);
    if (!email || !email.includes("@")) {
      alert("Sahi email address dalein.");
      return;
    }

    authBtn.disabled = true;
    authBtn.innerText = "Checking...";

    try {
      // Backend Apps Script ko payload bhejna (Security verification)
      /*
      const res = await fetch(CONFIG.APPS_SCRIPT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_user", email, deviceToken })
      });
      const data = await res.json();
      */

      // Simulation response: default "waiting" / denied
      setTimeout(() => {
        authBtn.disabled = false;
        authBtn.innerText = "Verify Access";

        // Yahan status aapke Google Sheet se milega: "active", "waiting", ya "denied"
        const mockStatus = "waiting"; // 'active' hone par unlock hoga

        if (mockStatus === "active") {
          localStorage.setItem(CONFIG.STORAGE_KEY_STATUS, "active");
          localStorage.setItem(CONFIG.STORAGE_KEY_EMAIL, email);
          unlockDashboard();
          showStatus("Access Granted! Dashboard Unlocked.", "status-active");
        } else if (mockStatus === "waiting") {
          localStorage.setItem(CONFIG.STORAGE_KEY_STATUS, "waiting");
          showStatus("Payment Verification Pending. Manual approval ke baad unlock hoga.", "status-waiting");
        } else {
          localStorage.setItem(CONFIG.STORAGE_KEY_STATUS, "denied");
          showStatus("Access Denied. Subscription inactive ya expired hai.", "status-denied");
        }
      }, 700);

    } catch (err) {
      authBtn.disabled = false;
      authBtn.innerText = "Verify Access";
      showStatus("Connection error. Kripya thodi der baad prayas karein.", "status-denied");
    }
  });

  // Manual Email App Redirect
  sendPlanRequestBtn.addEventListener("click", () => {
    const email = sanitizeInput(emailInput.value);
    const subject = encodeURIComponent("Subscription Activation Request - Share Market Course");
    const body = encodeURIComponent(
      `Hello Admin,\n\nMaine subscription ke liye request bheji hai.\nEmail: ${email || "Not specified"}\nDevice Token: ${deviceToken}\nKripya verification karke dashboard access activate karein.`
    );
    window.location.href = `mailto:admin@example.com?subject=${subject}&body=${body}`;
  });

  function unlockDashboard() {
    notesContainer.classList.remove("is-locked");
    lockOverlay.style.display = "none";
    accessNotice.innerText = "Access: Active (Unlocked)";
    accessNotice.style.color = "#10b981";
  }

  function showStatus(msg, className) {
    statusBadge.className = `status-badge ${className}`;
    statusBadge.innerText = msg;
    statusBadge.style.display = "block";
  }
}

/* ---------------- PLAYER PAGE LOGIC ---------------- */
function initPlayerPage() {
  const currentStatus = localStorage.getItem(CONFIG.STORAGE_KEY_STATUS);
  const activeEmail = localStorage.getItem(CONFIG.STORAGE_KEY_EMAIL) || "Member";
  
  // Guard clause: agar active nahi hai to wapas bhej do
  if (currentStatus !== "active") {
    alert("Unauthorized access! Please verify your active subscription.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("userActiveEmail").innerText = activeEmail;

  const urlParams = new URLSearchParams(window.location.search);
  let currentLessonId = urlParams.get("id") || SAMPLE_LESSONS[0].id;

  const videoViewport = document.getElementById("videoViewport");
  const videoPlayerFrame = document.getElementById("videoPlayerFrame");
  const currentLessonTitle = document.getElementById("currentLessonTitle");
  const currentLessonCat = document.getElementById("currentLessonCat");
  const lessonList = document.getElementById("lessonList");
  const ratioToggleBtn = document.getElementById("ratioToggleBtn");
  const autoPlayToggle = document.getElementById("autoPlayToggle");
  const totalCounter = document.getElementById("totalCounter");

  totalCounter.innerText = `${SAMPLE_LESSONS.length} Topics`;

  // Render list view
  function renderList() {
    lessonList.innerHTML = "";
    SAMPLE_LESSONS.forEach((lesson, index) => {
      const li = document.createElement("li");
      li.className = `lesson-item ${lesson.id === currentLessonId ? "active" : ""}`;
      li.innerHTML = `
        <span class="badge-type">${lesson.type}</span>
        <div style="flex:1; font-size:0.85rem;">
          <strong>L${index + 1}:</strong> ${lesson.title}
        </div>
      `;
      li.addEventListener("click", () => {
        loadLesson(lesson.id);
      });
      lessonList.appendChild(li);
    });
  }

  // Load selected lesson
  function loadLesson(id) {
    currentLessonId = id;
    const lesson = SAMPLE_LESSONS.find(l => l.id === id);
    if (!lesson) return;

    // Viewport frame type adjust (Short vs Long)
    if (lesson.type === "short") {
      videoViewport.classList.remove("mode-long");
      videoViewport.classList.add("mode-short");
    } else {
      videoViewport.classList.remove("mode-short");
      videoViewport.classList.add("mode-long");
    }

    currentLessonTitle.innerText = lesson.title;
    currentLessonCat.innerText = lesson.cat;

    // Embed URL protection flags (modestbranding, rel=0)
    videoPlayerFrame.src = `https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?autoplay=1&rel=0&modestbranding=1`;

    renderList();
  }

  // Frame toggle button
  ratioToggleBtn.addEventListener("click", () => {
    if (videoViewport.classList.contains("mode-long")) {
      videoViewport.classList.remove("mode-long");
      videoViewport.classList.add("mode-short");
    } else {
      videoViewport.classList.remove("mode-short");
      videoViewport.classList.add("mode-long");
    }
  });

  // Initial load
  loadLesson(currentLessonId);
}
