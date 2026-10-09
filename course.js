/**
 * Saralsharemarket - Complete Master Client Controller
 * Features: Google Sheet Video API, Channel Credits, Strict Single Device,
 * Drawer Navigation, Interactive Plan Mailer, and Cream Modal Alerts.
 */

const CONFIG = {
  // 1. Apna Google Apps Script Web App URL yahan paste karein
  APPS_SCRIPT_API_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",

  // 2. Official Admin Email (Jahan subscription request aayegi)
  ADMIN_EMAIL: "admin@example.com",

  // 3. Testing Switch: false = Production Secured, true = Demo Unlocked
  DEMO_MODE: false,

  // Local Storage Keys
  STORAGE_KEY_TOKEN: "ssm_device_token",
  STORAGE_KEY_EMAIL: "ssm_user_email",
  STORAGE_KEY_STATUS: "ssm_access_status"
};

// 7 Vibrant Note Color Classes
const NOTE_COLORS = ["c-green", "c-cyan", "c-pink", "c-yellow", "c-blue", "c-peach", "c-lavender"];

// ==========================================================================
// 300+ LESSON DATA REPOSITORY (Curated Roadmap with Channel Credits)
// Note: Asli private video links Google Sheet ke 'Videos' tab me rahenge.
// ==========================================================================
const LESSONS_DATA = [
/*  {
    id: "L001",
    cat: "Basics",
    title: "Stock Market Kya Hai? Complete Beginner Guide",
    channelName: "CA Rachana Phadke Ranade",
    url: "https://youtu.be/M7lc1UVf-VE", // Free Demo Link
    isFree: true,
    subLessons: [
      { id: "L001-1", title: "Share aur Equity me antar kya hai?", channelName: "CA Rachana Phadke Ranade" },
      { id: "L001-2", title: "BSE aur NSE: Stock exchanges kaise chalte hain", channelName: "Asset Yogi" }
    ]
  },
  */
  // Example in course.js:
// 10 minute 15 second = (10 * 60) + 15 = 615 seconds
// 25 minute 30 second = (25 * 60) + 30 = 1530 seconds
  {
    id: "L001",
    cat: "Basics",
    title: "Stock Market Kya Hai? Complete Beginner Guide",
    channelName: "CA Rachana Phadke Ranade",
    url: "https://youtu.be/M7lc1UVf-VE",
    start: 60,   // Video 1:00 minute se shuru hoga
    end: 300,    // Video 5:00 minute par ruk jayega
    isFree: true,
    subLessons: [
      { 
        id: "L001-1", 
        title: "Share aur Equity me antar kya hai?", 
        channelName: "CA Rachana Phadke Ranade",
        start: 310,  // Sub-lesson ka apna start time
        end: 650     // Sub-lesson ka apna end time
      }
    ]
  },

  {
    id: "L002",
    cat: "Basics",
    title: "Demat & Trading Account Setup aur Broker Charges",
    channelName: "Pranjal Kamra",
    url: "",
    isFree: false,
    subLessons: [
      { id: "L002-1", title: "Discount Brokers vs Full-Service Brokers", channelName: "Pranjal Kamra" }
    ]
  },
  {
    id: "L003",
    cat: "Technical",
    title: "Support & Resistance Masterclass: Key Levels",
    channelName: "Pushkar Raj Thakur",
    url: "",
    isFree: false,
    subLessons: [
      { id: "L003-1", title: "Swing High aur Swing Low draw karna", channelName: "Booming Bulls" },
      { id: "L003-2", title: "Breakout vs Fakeout kaise pehchanein", channelName: "Pushkar Raj Thakur" }
    ]
  },
  {
    id: "L004",
    cat: "Candlestick",
    title: "Hammer & Inverted Hammer Candlestick Strategy",
    channelName: "Booming Bulls",
    url: "",
    isFree: false,
    subLessons: []
  },
  {
    id: "L005",
    cat: "Fundamental",
    title: "PE Ratio, PB Ratio aur Balance Sheet Analysis",
    channelName: "Asset Yogi",
    url: "",
    isFree: false,
    subLessons: [
      { id: "L005-1", title: "Debt to Equity Ratio aur Free Cash Flow", channelName: "Asset Yogi" }
    ]
  },
  {
    id: "L006",
    cat: "F&O",
    title: "Options Trading Basics: Call (CE) vs Put (PE)",
    channelName: "Trading In The Zone",
    url: "",
    isFree: false,
    subLessons: []
  },
  {
    id: "L007",
    cat: "Psychology",
    title: "Trading Psychology: Fear, Greed & Position Sizing",
    channelName: "Power Of Stocks",
    url: "",
    isFree: false,
    subLessons: []
  }
];

// ==========================================================================
// UTILITIES: Security, Embed Formatter & Device Fingerprinting
// ==========================================================================

// Strict Email Sanitization
function sanitizeAndValidateEmail(rawEmail) {
  if (!rawEmail) return { valid: false, error: "Enter your email to register" };
  const cleaned = rawEmail.replace(/<[^>]*>?/gm, "").trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return { valid: false, error: "Kripya sahi format ka email daalein (jaise: name@example.com)." };
  }
  return { valid: true, email: cleaned };
}
/*
// YouTube URL to Clean Embed Player Formatter
function getCleanEmbedUrl(rawUrl) {
  if (!rawUrl) return "";
  let videoId = "";
  if (rawUrl.includes("/shorts/")) {
    videoId = rawUrl.split("/shorts/")[1].split("?")[0].split("/")[0];
  } else if (rawUrl.includes("youtu.be/")) {
    videoId = rawUrl.split("youtu.be/")[1].split("?")[0].split("/")[0];
  } else if (rawUrl.includes("v=")) {
    videoId = rawUrl.split("v=")[1].split("&")[0];
  } else {
    videoId = rawUrl.trim();
  }
  // Anti-branding & embed protection query parameters
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
}
*/
// YouTube URL Formatter with Custom Start & End Timestamps
function getCleanEmbedUrl(rawUrl, startSec = 0, endSec = 0) {
  if (!rawUrl) return "";
  let videoId = "";
  
  if (rawUrl.includes("/shorts/")) {
    videoId = rawUrl.split("/shorts/")[1].split("?")[0].split("/")[0];
  } else if (rawUrl.includes("youtu.be/")) {
    videoId = rawUrl.split("youtu.be/")[1].split("?")[0].split("/")[0];
  } else if (rawUrl.includes("v=")) {
    videoId = rawUrl.split("v=")[1].split("&")[0];
  } else {
    videoId = rawUrl.trim();
  }

  // Base embed URL
  let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;

  // Start timing parameter
  if (startSec && Number(startSec) > 0) {
    embedUrl += `&start=${Math.floor(startSec)}`;
  }

  // End timing parameter
  if (endSec && Number(endSec) > 0) {
    embedUrl += `&end=${Math.floor(endSec)}`;
  }

  return embedUrl;
}

// Single Device Fingerprint Token Generator
function getOrCreateDeviceToken() {
  let token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
  if (!token) {
    const rawEntropy = navigator.userAgent + screen.width + "x" + screen.height + Math.random().toString(36).substring(2);
    token = "ssm_" + btoa(rawEntropy).replace(/[^a-zA-Z0-9]/g, "").substring(0, 20);
    localStorage.setItem(CONFIG.STORAGE_KEY_TOKEN, token);
  }
  return token;
}

// ==========================================================================
// APP INITIALIZATION ROUTER
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  const deviceToken = getOrCreateDeviceToken();

  // Agar Index page par hain
  if (document.getElementById("notesContainer")) {
    initIndexPage(deviceToken);
  }

  // Agar Course Player page par hain
  if (document.getElementById("videoPlayerFrame")) {
    initPlayerPage();
  }
});

/* ==========================================================================
   INDEX PAGE LOGIC (Drawer, Pricing Selection, Auth, Search & Grid)
========================================================================== */
function initIndexPage(deviceToken) {
  const container = document.getElementById("notesContainer");
  const searchInput = document.getElementById("searchInput");
  const catFilter = document.getElementById("catFilter");
  const authBtn = document.getElementById("authBtn");
  const userEmail = document.getElementById("userEmail");
  const otpGroup = document.getElementById("otpGroup");
  const otpInput = document.getElementById("otpInput");
  const sendPlanRequestBtn = document.getElementById("sendPlanRequestBtn");
  const statusBadge = document.getElementById("statusBadge");
  const accessNotice = document.getElementById("accessNotice");
  const shareBtn = document.getElementById("shareBtn");

  let currentCategory = "All";
  let searchQuery = "";
  let isOtpStep = false;

  // Selected Plan State
  let selectedPlanData = {
    name: "Monthly Pass (30 Days)",
    price: "₹499",
    days: "30"
  };

  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";

  if (isUserActive && accessNotice) {
    accessNotice.innerText = "Status: Active (Unlocked)";
    accessNotice.style.color = "#10b981";
  }

  // 1. Drawer Navigation Controls
  const openDrawerBtn = document.getElementById("openDrawerBtn");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerRefreshBtn = document.getElementById("drawerRefreshBtn");
  const installAppBtn = document.getElementById("installAppBtn");

  if (openDrawerBtn && drawerOverlay) {
    openDrawerBtn.addEventListener("click", () => drawerOverlay.classList.add("active"));
    closeDrawerBtn.addEventListener("click", () => drawerOverlay.classList.remove("active"));
    drawerOverlay.addEventListener("click", (e) => {
      if (e.target === drawerOverlay) drawerOverlay.classList.remove("active");
    });
  }

  if (drawerRefreshBtn) {
    drawerRefreshBtn.addEventListener("click", () => location.reload());
  }

  if (installAppBtn) {
    installAppBtn.addEventListener("click", () => {
      alert("Mobile Browser Menu (3-dots) me jakar 'Add to Home Screen' par tap karein.");
    });
  }

  // 2. Interactive Pricing Plan Card Selection
  const priceCards = document.querySelectorAll(".price-card");
  const selectedPlanNotice = document.getElementById("selectedPlanNotice");

  priceCards.forEach(card => {
    card.addEventListener("click", () => {
      priceCards.forEach(c => {
        c.classList.remove("selected");
        const radio = c.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      });

      card.classList.add("selected");
      const activeRadio = card.querySelector('input[type="radio"]');
      if (activeRadio) activeRadio.checked = true;

      selectedPlanData = {
        name: card.getAttribute("data-plan"),
        price: card.getAttribute("data-price"),
        days: card.getAttribute("data-days")
      };

      if (selectedPlanNotice) {
        selectedPlanNotice.innerText = `Selected Plan: ${selectedPlanData.name} - ${selectedPlanData.price}`;
      }
    });
  });

  // 3. Render High-Density Sticky Notes Grid
  function renderGrid() {
    container.innerHTML = "";

    const filtered = LESSONS_DATA.filter(lesson => {
      const matchCat = (currentCategory === "All" || lesson.cat === currentCategory);
      const matchSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lesson.channelName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    filtered.forEach((lesson, index) => {
      const color = NOTE_COLORS[index % NOTE_COLORS.length];
      const note = document.createElement("div");
      note.className = `sticky-note ${color}`;

      const canPlay = isUserActive || lesson.isFree;
      const cornerLock = canPlay ? "" : `<span class="corner-lock"><i class="fa-solid fa-lock"></i></span>`;

      // Sub-topics Preview
      let subPreviewHtml = "";
      if (lesson.subLessons && lesson.subLessons.length > 0) {
        subPreviewHtml = `<ul class="subtopics-preview">
          ${lesson.subLessons.slice(0, 2).map(s => `<li>${s.title}</li>`).join("")}
          ${lesson.subLessons.length > 2 ? `<li>+${lesson.subLessons.length - 2} more...</li>` : ""}
        </ul>`;
      }

      const footerTag = lesson.isFree 
        ? `<span class="badge-free">FREE DEMO</span>` 
        : (isUserActive ? `<i class="fa-solid fa-play"></i>` : `<i class="fa-solid fa-lock" style="color:#475569;"></i>`);

            // Pehle By ${lesson.channelName} likha tha, ab use clean kar diya gaya hai
      note.innerHTML = `
        ${cornerLock}
        <div>
          <span class="lesson-num">#${lesson.id} • ${lesson.cat}</span>
          <div class="lesson-title">${lesson.title}</div>
          ${subPreviewHtml}
        </div>
        <div class="note-footer" style="display:flex; justify-content:flex-end; align-items:center;">
          ${footerTag}
        </div>
      `;

      note.addEventListener("click", () => {
        if (canPlay) {
          window.location.href = `course.html?id=${lesson.id}`;
        } else {
          showLockedModal(lesson.title, lesson.subLessons);
        }
      });

      container.appendChild(note);
    });
  }

  // 4. OTP / Registration Multi-Step Flow
  authBtn.addEventListener("click", async () => {
    const emailResult = sanitizeAndValidateEmail(userEmail.value);
    if (!emailResult.valid) {
      alert(emailResult.error);
      userEmail.focus();
      return;
    }

    if (!isOtpStep) {
      // Step 1: Send OTP via Apps Script
      authBtn.innerText = "Sending OTP...";
      authBtn.disabled = true;

      try {
        const response = await fetch(CONFIG.APPS_SCRIPT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "send_otp",
            email: emailResult.email,
            deviceToken: deviceToken
          })
        });

        const data = await response.json();

        authBtn.disabled = false;
        if (data.success) {
          authBtn.innerText = "Submit OTP & Verify";
          otpGroup.style.display = "block";
          otpInput.focus();
          isOtpStep = true;

          showStatusBadge(`OTP sent to ${emailResult.email}. (Spam/Promotions check karein)`, "status-waiting");
        } else if (data.deviceBlocked) {
          authBtn.innerText = "Get OTP / Register";
          alert(data.message);
        } else {
          authBtn.innerText = "Get OTP / Register";
          alert("Error: " + data.message);
        }
      } catch (err) {
        authBtn.disabled = false;
        authBtn.innerText = "Get OTP / Register";
        alert("Server connect nahi ho saka. Kripya thodi der baad try karein.");
      }

    } else {
      // Step 2: Verify OTP
      const otp = otpInput.value.trim();
      if (!otp || otp.length < 4) {
        alert("Kripya 6-digit OTP daalein.");
        otpInput.focus();
        return;
      }

      authBtn.innerText = "Verifying...";
      authBtn.disabled = true;

      try {
        const response = await fetch(CONFIG.APPS_SCRIPT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "verify_otp",
            email: emailResult.email,
            otp: otp,
            deviceToken: deviceToken
          })
        });

        const data = await response.json();
        authBtn.disabled = false;
        authBtn.innerText = "Verify Access";

        if (data.success) {
          localStorage.setItem(CONFIG.STORAGE_KEY_EMAIL, emailResult.email);
          localStorage.setItem(CONFIG.STORAGE_KEY_STATUS, data.status);

          if (data.status === "active") {
            showStatusBadge("Account Active! Sabhi chapters unlock hain.", "status-active");
            setTimeout(() => location.reload(), 600);
          } else {
            showStatusBadge("OTP Verified! Admin payment approval pending hai.", "status-waiting");
          }
        } else {
          alert("Galti: " + data.message);
        }
      } catch (err) {
        authBtn.disabled = false;
        authBtn.innerText = "Submit OTP & Verify";
        alert("Verification server error. Dobara prayas karein.");
      }
    }
  });

  // 5. Send Activation Request via Email (Plan & Price Aware)
  sendPlanRequestBtn.addEventListener("click", () => {
    const emailResult = sanitizeAndValidateEmail(userEmail.value);
    const email = emailResult.valid ? emailResult.email : "Not specified";

    const subject = encodeURIComponent(`Activation Request: ${selectedPlanData.name}`);
    const body = encodeURIComponent(
      `Hello Admin,\n\n` +
      `Maine Saralsharemarket par subscription select kiya hai:\n\n` +
      `----------------------------------------\n` +
      `Selected Plan : ${selectedPlanData.name}\n` +
      `Plan Price    : ${selectedPlanData.price}\n` +
      `Validity      : ${selectedPlanData.days} Days\n` +
      `User Email    : ${email}\n` +
      `Device Token  : ${deviceToken}\n` +
      `----------------------------------------\n\n` +
      `Kripya mera payment verify karke dashboard access chalu karein.\n\nDhanyawad!`
    );
    window.location.href = `mailto:${CONFIG.ADMIN_EMAIL}?subject=${subject}&body=${body}`;
  });

  // 6. Search & Category Filters
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    renderGrid();
  });

  catFilter.addEventListener("click", (e) => {
    if (e.target.classList.contains("cat-chip")) {
      document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      currentCategory = e.target.getAttribute("data-cat");
      renderGrid();
    }
  });

  // 7. Native Share API
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Saralsharemarket | Curated Learning Roadmap",
            text: "300+ Chapters on Stock Market Basics, Technical Analysis & Candlesticks!",
            url: window.location.href
          });
        } catch (err) {}
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Website link copied!");
      }
    });
  }

  function showStatusBadge(msg, className) {
    statusBadge.className = `status-badge ${className}`;
    statusBadge.innerText = msg;
    statusBadge.style.display = "block";
  }

  renderGrid();
}

/* Modal Helpers */
function showLockedModal(title, subLessons) {
  document.getElementById("modalTopicTitle").innerText = `"${title}"`;
  let desc = "Ye chapter dekhne ke liye subscription zaroori hai.";
  if (subLessons && subLessons.length > 0) {
    desc += ` Is module ke andar ${subLessons.length} aur practical sub-topics shamil hain.`;
  }
  document.getElementById("modalTopicDesc").innerText = desc;
  document.getElementById("subscribeModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("subscribeModal").style.display = "none";
}
function closeModalAndScroll() {
  closeModal();
  const el = document.getElementById("authBox");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* ==========================================================================
   SMOOTH IN-PAGE SWITCHER (Single Back Press Fix)
========================================================================== */

function initPlayerPage() {
  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";
  const activeEmail = localStorage.getItem(CONFIG.STORAGE_KEY_EMAIL) || "";
  const deviceToken = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN) || "";

  const userEmailDisplay = document.getElementById("userActiveEmail");
  if (userEmailDisplay) userEmailDisplay.innerText = activeEmail ? activeEmail : "Member";

  const urlParams = new URLSearchParams(window.location.search);
  const activeId = urlParams.get("id") || LESSONS_DATA[0].id;

  // Initial load
  switchLessonInPlayer(activeId, isUserActive, activeEmail, deviceToken, false);
}

// Function to switch lesson dynamically without creating new history entries
function switchLessonInPlayer(activeId, isUserActive, activeEmail, deviceToken, pushHistory = true) {
  let selectedLesson = LESSONS_DATA.find(l => l.id === activeId);
  let parentLesson = selectedLesson;

  if (!selectedLesson) {
    for (let p of LESSONS_DATA) {
      const sub = p.subLessons.find(s => s.id === activeId);
      if (sub) {
        selectedLesson = sub;
        parentLesson = p;
        break;
      }
    }
  }

  if (!selectedLesson) selectedLesson = LESSONS_DATA[0];

  // 1. URL update bina naya history record banaye (Single Back Click Fix)
  if (pushHistory) {
    history.replaceState({ id: activeId }, selectedLesson.title, `course.html?id=${activeId}`);
  }

  // 2. Breadcrumbs aur Titles update
  const breadCat = document.getElementById("breadCat");
  const breadTitle = document.getElementById("breadTitle");
  const currentTitle = document.getElementById("currentLessonTitle");
  const creatorNameEl = document.getElementById("creatorName");

  if (breadCat) breadCat.innerText = parentLesson.cat || "Topic";
  if (breadTitle) breadTitle.innerText = selectedLesson.title;
  if (currentTitle) currentTitle.innerText = selectedLesson.title;
  if (creatorNameEl) creatorNameEl.innerText = selectedLesson.channelName || parentLesson.channelName || "Market Expert";

  // 3. Playlist active highlights update
  renderPlaylistView(activeId, isUserActive, activeEmail, deviceToken);

  // 4. Video load
  fetchVideoFromSheet(activeId, selectedLesson, isUserActive, activeEmail, deviceToken);
}
/*
  function initPlayerPage() {
  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";
  const activeEmail = localStorage.getItem(CONFIG.STORAGE_KEY_EMAIL) || "";
  const deviceToken = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN) || "";

  const userEmailDisplay = document.getElementById("userActiveEmail");
  if (userEmailDisplay) userEmailDisplay.innerText = activeEmail ? activeEmail : "Member";

  const urlParams = new URLSearchParams(window.location.search);
  const activeId = urlParams.get("id") || LESSONS_DATA[0].id;

  // 1. Identify Active Lesson & Parent
  let selectedLesson = LESSONS_DATA.find(l => l.id === activeId);
  let parentLesson = selectedLesson;

  if (!selectedLesson) {
    for (let p of LESSONS_DATA) {
      const sub = p.subLessons.find(s => s.id === activeId);
      if (sub) {
        selectedLesson = sub;
        parentLesson = p;
        break;
      }
    }
  }

  if (!selectedLesson) selectedLesson = LESSONS_DATA[0];

  // 2. Update Breadcrumbs & Titles
  const breadCat = document.getElementById("breadCat");
  const breadTitle = document.getElementById("breadTitle");
  const currentTitle = document.getElementById("currentLessonTitle");
  const creatorNameEl = document.getElementById("creatorName");

  if (breadCat) breadCat.innerText = parentLesson.cat || "Topic";
  if (breadTitle) breadTitle.innerText = selectedLesson.title;
  if (currentTitle) currentTitle.innerText = selectedLesson.title;
  if (creatorNameEl) creatorNameEl.innerText = selectedLesson.channelName || parentLesson.channelName || "Market Expert";

  // 3. Render Sidebar / Bottom List (User saare titles dekh sake)
  renderPlaylistView(activeId, isUserActive);

  // 4. Video Pull ya Lock Overlay show karna (No Redirect!)
  fetchVideoFromSheet(activeId, selectedLesson, isUserActive, activeEmail, deviceToken);
}
*/
// ========================================================
// NO-REDIRECT VIDEO FETCH / LOCK CONTROLLER
// ========================================================
/* async function fetchVideoFromSheet(lessonId, lessonObj, isUserActive, email, token) {
  const frame = document.getElementById("videoPlayerFrame");
  const lockOverlay = document.getElementById("playerLockOverlay");

  frame.src = "about:blank";

  // Case 1: Agar Free Demo Video hai to video chalne do, overlay chupao
  if (lessonObj.isFree) {
    if (lockOverlay) lockOverlay.style.display = "none";
    frame.src = getCleanEmbedUrl(lessonObj.url || "https://youtu.be/M7lc1UVf-VE");
    return;
  }

  // Case 2: Agar User Active NAHI hai, to Redirect MAT KARO, sirf Lock Card dikhao!
  if (!isUserActive) {
    if (lockOverlay) lockOverlay.style.display = "flex";
    return; // User usi page par rahega aur baaki saare titles scroll karke dekhega
  }

  // Case 3: Agar User Active hai, to overlay chupao aur Google Sheet se video load karo
  if (lockOverlay) lockOverlay.style.display = "none";

  try {
    const response = await fetch(CONFIG.APPS_SCRIPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "get_video_url",
        lessonId: lessonId,
        email: email,
        deviceToken: token
      })
    });

    const data = await response.json();

    if (data.success && data.url) {
      frame.src = getCleanEmbedUrl(data.url);
    } else {
      if (lockOverlay) lockOverlay.style.display = "flex";
    }

  } catch (err) {
    console.error("Sheet API Error:", err);
    if (lockOverlay) lockOverlay.style.display = "flex";
  }
}
 */
   async function fetchVideoFromSheet(lessonId, lessonObj, isUserActive, email, token) {
  const frame = document.getElementById("videoPlayerFrame");
  const lockOverlay = document.getElementById("playerLockOverlay");

  frame.src = "about:blank";

  // Case 1: Agar Free Demo Video hai to video chalne do (with Start/End timing)
  if (lessonObj.isFree) {
    if (lockOverlay) lockOverlay.style.display = "none";
    const startSec = lessonObj.start || 0;
    const endSec = lessonObj.end || 0;
    frame.src = getCleanEmbedUrl(lessonObj.url || "https://youtu.be/M7lc1UVf-VE", startSec, endSec);
    return;
  }

  // Case 2: Agar User Active NAHI hai, to Redirect MAT KARO, sirf Lock Card dikhao!
  if (!isUserActive) {
    if (lockOverlay) lockOverlay.style.display = "flex";
    return; // User usi page par rahega aur baaki saare titles scroll karke dekhega
  }

  // Case 3: Agar User Active hai, to overlay chupao aur Google Sheet se video load karo
  if (lockOverlay) lockOverlay.style.display = "none";

  try {
    const response = await fetch(CONFIG.APPS_SCRIPT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "get_video_url",
        lessonId: lessonId,
        email: email,
        deviceToken: token
      })
    });

    const data = await response.json();

    if (data.success && data.url) {
      // Backend se ya local lesson data se start aur end timing uthana
      const startSec = (data.start !== undefined ? data.start : lessonObj.start) || 0;
      const endSec = (data.end !== undefined ? data.end : lessonObj.end) || 0;
      
      frame.src = getCleanEmbedUrl(data.url, startSec, endSec);
    } else {
      if (lockOverlay) lockOverlay.style.display = "flex";
    }

  } catch (err) {
    console.error("Sheet API Error:", err);
    if (lockOverlay) lockOverlay.style.display = "flex";
  }
}

/*
function renderPlaylistView(activeId, isUserActive) {
  const listContainer = document.getElementById("lessonList");
  if (!listContainer) return;

  const counter = document.getElementById("totalCounter");
  if (counter) counter.innerText = `${LESSONS_DATA.length} Chapters`;

  // 6 Alternating Border Colors
  const borderColors = ["border-blue", "border-red", "border-green", "border-amber", "border-purple", "border-cyan"];

  listContainer.innerHTML = "";
  LESSONS_DATA.forEach((parent, index) => {
    const isParentActive = (parent.id === activeId);
    const canAccessParent = isUserActive || parent.isFree;
    const borderClass = borderColors[index % borderColors.length];

    // Chapter number (e.g., #01, #02, #10)
    const chapNumber = `#${String(index + 1).padStart(2, '0')}`;

    const group = document.createElement("li");
    group.className = `parent-group ${borderClass}`;

        group.innerHTML = `
      <div class="parent-header ${isParentActive ? 'active' : ''}">
        <span class="chap-badge">${chapNumber}</span>
        <span class="chap-title-text">${parent.title}</span>
        ${parent.isFree ? '<span class="badge-free">FREE</span>' : (!canAccessParent ? '<i class="fa-solid fa-lock" style="font-size:0.75rem; color:#94a3b8;"></i>' : '')}
      </div>
      ${parent.subLessons && parent.subLessons.length > 0 ? `
        <ul class="sub-list">
          ${parent.subLessons.map((sub, sIdx) => `
            <li class="sub-item ${sub.id === activeId ? 'active' : ''}" data-id="${sub.id}">
              <span style="font-size:0.65rem; color:#94a3b8; font-weight:700;">${chapNumber}.${sIdx + 1}</span>
              <span style="flex:1;">${sub.title}</span>
              <i class="fa-solid fa-play" style="font-size:0.55rem; color:#94a3b8;"></i>
            </li>
          `).join("")}
        </ul>
      ` : ""}
    `;

    group.querySelector(".parent-header").addEventListener("click", () => {
      window.location.href = `course.html?id=${parent.id}`;
    });

    group.querySelectorAll(".sub-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `course.html?id=${item.getAttribute("data-id")}`;
      });
    });

    listContainer.appendChild(group);
  });
}
*/
// Render Numbered & Colorful Border Playlist with In-Page Click
function renderPlaylistView(activeId, isUserActive, activeEmail, deviceToken) {
  const listContainer = document.getElementById("lessonList");
  if (!listContainer) return;

  const counter = document.getElementById("totalCounter");
  if (counter) counter.innerText = `${LESSONS_DATA.length} Chapters`;

  const borderColors = ["border-blue", "border-red", "border-green", "border-amber", "border-purple", "border-cyan"];

  listContainer.innerHTML = "";
  LESSONS_DATA.forEach((parent, index) => {
    const isParentActive = (parent.id === activeId);
    const canAccessParent = isUserActive || parent.isFree;
    const borderClass = borderColors[index % borderColors.length];
    const chapNumber = `#${String(index + 1).padStart(2, '0')}`;

    const group = document.createElement("li");
    group.className = `parent-group ${borderClass}`;

    group.innerHTML = `
      <div class="parent-header ${isParentActive ? 'active' : ''}">
        <span class="chap-badge">${chapNumber}</span>
        <span class="chap-title-text">${parent.title}</span>
        ${parent.isFree ? '<span class="badge-free">FREE</span>' : (!canAccessParent ? '<i class="fa-solid fa-lock" style="font-size:0.75rem; color:#94a3b8;"></i>' : '')}
      </div>
      ${parent.subLessons && parent.subLessons.length > 0 ? `
        <ul class="sub-list">
          ${parent.subLessons.map((sub, sIdx) => `
            <li class="sub-item ${sub.id === activeId ? 'active' : ''}" data-id="${sub.id}">
              <span style="font-size:0.65rem; color:#94a3b8; font-weight:700;">${chapNumber}.${sIdx + 1}</span>
              <span style="flex:1;">${sub.title}</span>
              <i class="fa-solid fa-play" style="font-size:0.55rem; color:#94a3b8;"></i>
            </li>
          `).join("")}
        </ul>
      ` : ""}
    `;

    // Click Parent -> Dynamic Switch (No full page reload)
    group.querySelector(".parent-header").addEventListener("click", () => {
      switchLessonInPlayer(parent.id, isUserActive, activeEmail, deviceToken, true);
    });

    // Click Sub-item -> Dynamic Switch
    group.querySelectorAll(".sub-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const subId = item.getAttribute("data-id");
        switchLessonInPlayer(subId, isUserActive, activeEmail, deviceToken, true);
      });
    });

    listContainer.appendChild(group);
  });
}
