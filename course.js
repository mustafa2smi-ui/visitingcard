/**
 * Course LMS & Authentication Controller (Optimized for High-Density UI & Modal Trigger)
 */

const CONFIG = {
  APPS_SCRIPT_API_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  STORAGE_KEY_TOKEN: "smc_device_token",
  STORAGE_KEY_EMAIL: "smc_user_email",
  STORAGE_KEY_STATUS: "smc_access_status"
};

// 300+ Index demo set (Dense testing)
const SAMPLE_LESSONS = [
  { id: "L001", cat: "Basics", title: "Stock Market Kya Hai?", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L002", cat: "Basics", title: "BSE aur NSE me antar kya hai?", type: "short", youtubeId: "dQw4w9WgXcQ" },
  { id: "L003", cat: "Basics", title: "Demat aur Trading Account ka role", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L004", cat: "Basics", title: "Nifty aur Sensex index kaise calculate hote hain?", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L005", cat: "Charts", title: "Candlestick Chart Basics", type: "short", youtubeId: "dQw4w9WgXcQ" },
  { id: "L006", cat: "Charts", title: "Support aur Resistance Level Draw Karna", type: "short", youtubeId: "dQw4w9WgXcQ" },
  { id: "L007", cat: "Patterns", title: "Hammer & Inverted Hammer Candlestick", type: "short", youtubeId: "dQw4w9WgXcQ" },
  { id: "L008", cat: "Patterns", title: "Bullish Engulfing & Bearish Engulfing", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L009", cat: "Rules", title: "Stop Loss lagane ka exact tarika", type: "short", youtubeId: "dQw4w9WgXcQ" },
  { id: "L010", cat: "Rules", title: "Risk Reward Ratio 1:2 kaise maintain karein", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L011", cat: "F&O", title: "Options Trading: Call vs Put Kya Hai?", type: "long", youtubeId: "dQw4w9WgXcQ" },
  { id: "L012", cat: "F&O", title: "Strike Price (ITM, ATM, OTM) ka concept", type: "short", youtubeId: "dQw4w9WgXcQ" }
];

function sanitizeInput(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML.trim();
}

function getOrCreateDeviceToken() {
  let token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
  if (!token) {
    const raw = navigator.userAgent + screen.width + "x" + screen.height + Math.random().toString(36).substring(2);
    token = "dev_" + btoa(raw).replace(/[^a-zA-Z0-9]/g, "").substring(0, 24);
    localStorage.setItem(CONFIG.STORAGE_KEY_TOKEN, token);
  }
  return token;
}

document.addEventListener("DOMContentLoaded", () => {
  const deviceToken = getOrCreateDeviceToken();

  if (document.getElementById("notesContainer")) {
    initIndexPage(deviceToken);
  }

  if (document.getElementById("videoPlayerFrame")) {
    initPlayerPage();
  }
});

/* ---------------- INDEX PAGE ---------------- */
function initIndexPage(deviceToken) {
  const notesContainer = document.getElementById("notesContainer");
  const emailInput = document.getElementById("userEmail");
  const authBtn = document.getElementById("authBtn");
  const statusBadge = document.getElementById("statusBadge");
  const accessNotice = document.getElementById("accessNotice");
  const sendPlanRequestBtn = document.getElementById("sendPlanRequestBtn");

  const noteColors = ["note-c1", "note-c2", "note-c3", "note-c4", "note-c5"];
 // const currentStatus = localStorage.getItem(CONFIG.STORAGE_KEY_STATUS);
/* --- YAHAN CHANGE KAREIN --- */
// const currentStatus = localStorage.getItem(CONFIG.STORAGE_KEY_STATUS);
const currentStatus = "active"; // <-- ISE 'active' KAR DEIN TEST KE LIYE

  if (currentStatus === "active") {
    accessNotice.innerText = "Status: Unlocked (Active)";
    accessNotice.style.color = "#10b981";
  }

  // Render High Density Notes
  notesContainer.innerHTML = "";
  SAMPLE_LESSONS.forEach((lesson, index) => {
    const colorClass = noteColors[index % noteColors.length];
    const note = document.createElement("div");
    note.className = `sticky-note ${colorClass}`;
    
    // Agar active nahi hai to lock icon dikhega
    const lockIcon = (currentStatus === "active") 
      ? "" 
      : `<span class="locked-indicator"><i class="fa-solid fa-lock"></i></span>`;

    note.innerHTML = `
      ${lockIcon}
      <div>
        <span class="lesson-num">#${index + 1} ${lesson.cat}</span>
        <div class="lesson-title">${lesson.title}</div>
      </div>
      <div class="note-footer">
        <span><i class="fa-solid ${lesson.type === 'short' ? 'fa-mobile' : 'fa-play'}"></i> ${lesson.type}</span>
        <i class="fa-solid ${currentStatus === 'active' ? 'fa-arrow-right' : 'fa-lock'}"></i>
      </div>
    `;

    // Click behavior
    note.addEventListener("click", () => {
      const liveStatus = localStorage.getItem(CONFIG.STORAGE_KEY_STATUS);
      if (liveStatus === "active") {
        window.location.href = `course.html?id=${lesson.id}`;
      } else {
        // Non-touchable: Blur nahi hai, seedha attractive modal pop-up open hoga
        showLockedModal(lesson.title);
      }
    });

    notesContainer.appendChild(notesContainer.children.length === 0 ? note : note);
  });

  // Auth Button handler
  authBtn.addEventListener("click", async () => {
    const email = sanitizeInput(emailInput.value);
    if (!email || !email.includes("@")) {
      alert("Kripya sahi email address dalein.");
      return;
    }

    authBtn.disabled = true;
    authBtn.innerText = "Verifying...";

    setTimeout(() => {
      authBtn.disabled = false;
      authBtn.innerText = "Verify Access";

      // Mock status: Default "waiting" taaki payment manual verify ho
     // const mockStatus = "waiting"; 
// const mockStatus = "waiting";
const mockStatus = "active"; // <-- ISE BHI 'active' KAR DEIN

      if (mockStatus === "active") {
        localStorage.setItem(CONFIG.STORAGE_KEY_STATUS, "active");
        localStorage.setItem(CONFIG.STORAGE_KEY_EMAIL, email);
        accessNotice.innerText = "Status: Unlocked (Active)";
        accessNotice.style.color = "#10b981";
        showStatus("Access Granted! Sabhi lessons unlock ho gaye.", "status-active");
        location.reload();
      } else if (mockStatus === "waiting") {
        localStorage.setItem(CONFIG.STORAGE_KEY_STATUS, "waiting");
        showStatus("Payment Verification Pending. Admin review ke baad unlock hoga.", "status-waiting");
      } else {
        localStorage.setItem(CONFIG.STORAGE_KEY_STATUS, "denied");
        showStatus("Access Denied. Plan active nahi hai.", "status-denied");
      }
    }, 600);
  });

  sendPlanRequestBtn.addEventListener("click", () => {
    const email = sanitizeInput(emailInput.value);
    const subject = encodeURIComponent("Share Market Course Activation Request");
    const body = encodeURIComponent(
      `Hello Admin,\n\nMaine plan select kar liya hai.\nEmail: ${email || "N/A"}\nDevice Token: ${deviceToken}\nKripya status active karein.`
    );
    window.location.href = `mailto:admin@example.com?subject=${subject}&body=${body}`;
  });

  function showStatus(msg, className) {
    statusBadge.className = `status-badge ${className}`;
    statusBadge.innerText = msg;
    statusBadge.style.display = "block";
  }
}

/* Modal Helpers */
function showLockedModal(title) {
  document.getElementById("modalTopicTitle").innerText = `"${title}"`;
  document.getElementById("subscribeModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("subscribeModal").style.display = "none";
}
function closeModalAndScroll() {
  closeModal();
  scrollToAuth();
}
function scrollToAuth() {
  const el = document.getElementById("authBox");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* ---------------- PLAYER PAGE ---------------- */
function initPlayerPage() {
//  const currentStatus = localStorage.getItem(CONFIG.STORAGE_KEY_STATUS);
//  const activeEmail = localStorage.getItem(CONFIG.STORAGE_KEY_EMAIL) || "Member";
  
/*  if (currentStatus !== "active") {
    alert("Unauthorized! Pehle subscription active karein.");
    window.location.href = "index.html";
    return;
  }
*/
  const userEmailDisplay = document.getElementById("userActiveEmail");
  if (userEmailDisplay) userEmailDisplay.innerText = activeEmail;

  const urlParams = new URLSearchParams(window.location.search);
  let currentLessonId = urlParams.get("id") || SAMPLE_LESSONS[0].id;

  const videoViewport = document.getElementById("videoViewport");
  const videoPlayerFrame = document.getElementById("videoPlayerFrame");
  const currentLessonTitle = document.getElementById("currentLessonTitle");
  const currentLessonCat = document.getElementById("currentLessonCat");
  const lessonList = document.getElementById("lessonList");
  const ratioToggleBtn = document.getElementById("ratioToggleBtn");
  const totalCounter = document.getElementById("totalCounter");

  if (totalCounter) totalCounter.innerText = `${SAMPLE_LESSONS.length} Topics`;

  function renderList() {
    if (!lessonList) return;
    lessonList.innerHTML = "";
    SAMPLE_LESSONS.forEach((lesson, index) => {
      const li = document.createElement("li");
      li.className = `lesson-item ${lesson.id === currentLessonId ? "active" : ""}`;
      li.innerHTML = `
        <span class="badge-type">${lesson.type}</span>
        <div style="flex:1; font-size:0.8rem; line-height:1.2;">
          <strong>#${index + 1}:</strong> ${lesson.title}
        </div>
      `;
      li.addEventListener("click", () => loadLesson(lesson.id));
      lessonList.appendChild(li);
    });
  }

  function loadLesson(id) {
    currentLessonId = id;
    const lesson = SAMPLE_LESSONS.find(l => l.id === id);
    if (!lesson) return;

    if (lesson.type === "short") {
      videoViewport.classList.remove("mode-long");
      videoViewport.classList.add("mode-short");
    } else {
      videoViewport.classList.remove("mode-short");
      videoViewport.classList.add("mode-long");
    }

    if (currentLessonTitle) currentLessonTitle.innerText = lesson.title;
    if (currentLessonCat) currentLessonCat.innerText = lesson.cat;

    videoPlayerFrame.src = `https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
    renderList();
  }

  if (ratioToggleBtn) {
    ratioToggleBtn.addEventListener("click", () => {
      if (videoViewport.classList.contains("mode-long")) {
        videoViewport.classList.remove("mode-long");
        videoViewport.classList.add("mode-short");
      } else {
        videoViewport.classList.remove("mode-short");
        videoViewport.classList.add("mode-long");
      }
    });
  }

  loadLesson(currentLessonId);
}
