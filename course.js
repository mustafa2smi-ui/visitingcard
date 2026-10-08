/**
 * Course LMS Controller - Demo & Direct URL Engine
 */

const CONFIG = {
  // ==========================================
  // 1) TEST/DEMO SWITCH: 
  // true = Saare videos unlock, bina password/email chalenge
  // false = Production mode (Lock + Status check active)
  // ==========================================
  DEMO_MODE: true, 

  STORAGE_KEY_TOKEN: "smc_device_token",
  STORAGE_KEY_EMAIL: "smc_user_email",
  STORAGE_KEY_STATUS: "smc_access_status"
};

// ==========================================
// 2) SEEDHA YOUTUBE SHARE LINK PASTE KAREIN
// (Long video ho ya Shorts link, direct paste chalega)
// ==========================================
const SAMPLE_LESSONS = [
  {
    id: "L001",
    cat: "Basics",
    title: "Stock Market Kya Hai? Complete Guide",
    type: "long",
    url: "https://youtu.be/M7lc1UVf-VE" // <-- Direct share link paste karein
  },
  {
    id: "L002",
    cat: "Basics",
    title: "BSE aur NSE me antar kya hai?",
    type: "short",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ" // <-- Direct shorts link
  },
  {
    id: "L003",
    cat: "Basics",
    title: "Demat aur Trading Account ka role",
    type: "long",
    url: "https://www.youtube.com/watch?v=M7lc1UVf-VE" // <-- Standard watch link
  },
  {
    id: "L004",
    cat: "Charts",
    title: "Candlestick Charts reading kaise shuru karein?",
    type: "long",
    url: "https://youtu.be/M7lc1UVf-VE"
  },
  {
    id: "L005",
    cat: "Charts",
    title: "Support aur Resistance Level Draw Karna",
    type: "short",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ"
  },
  {
    id: "L006",
    cat: "Rules",
    title: "Stop Loss lagane ka exact rule",
    type: "short",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ"
  }
];

// YouTube URL se automatically Embed URL banane wala smart helper
function getCleanEmbedUrl(rawUrl) {
  if (!rawUrl) return "";
  let videoId = "";

  // 1. Shorts URL: youtube.com/shorts/ID
  if (rawUrl.includes("/shorts/")) {
    videoId = rawUrl.split("/shorts/")[1].split("?")[0].split("/")[0];
  } 
  // 2. Short URL: youtu.be/ID
  else if (rawUrl.includes("youtu.be/")) {
    videoId = rawUrl.split("youtu.be/")[1].split("?")[0].split("/")[0];
  } 
  // 3. Regular URL: youtube.com/watch?v=ID
  else if (rawUrl.includes("v=")) {
    videoId = rawUrl.split("v=")[1].split("&")[0];
  } 
  // 4. Pehle se embed ID ya direct string
  else {
    videoId = rawUrl.trim();
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

// Device Token Generator
function getOrCreateDeviceToken() {
  let token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
  if (!token) {
    token = "dev_" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem(CONFIG.STORAGE_KEY_TOKEN, token);
  }
  return token;
}

// Main Initializer
document.addEventListener("DOMContentLoaded", () => {
  const deviceToken = getOrCreateDeviceToken();

  if (document.getElementById("notesContainer")) {
    initIndexPage(deviceToken);
  }

  if (document.getElementById("videoPlayerFrame")) {
    initPlayerPage();
  }
});

/* ---------------- INDEX PAGE LOGIC ---------------- */
function initIndexPage(deviceToken) {
  const notesContainer = document.getElementById("notesContainer");
  const accessNotice = document.getElementById("accessNotice");
  const authBtn = document.getElementById("authBtn");
  const userEmail = document.getElementById("userEmail");
  const statusBadge = document.getElementById("statusBadge");

  // DEMO MODE check
  const isUnlocked = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";

  if (isUnlocked) {
    if (accessNotice) {
      accessNotice.innerText = CONFIG.DEMO_MODE ? "Status: DEMO MODE (Unlocked)" : "Status: Active (Unlocked)";
      accessNotice.style.color = "#10b981";
    }
  }

  const noteColors = ["note-c1", "note-c2", "note-c3", "note-c4", "note-c5"];
  notesContainer.innerHTML = "";

  SAMPLE_LESSONS.forEach((lesson, index) => {
    const colorClass = noteColors[index % noteColors.length];
    const note = document.createElement("div");
    note.className = `sticky-note ${colorClass}`;

    const lockIcon = isUnlocked ? "" : `<span class="locked-indicator"><i class="fa-solid fa-lock"></i></span>`;

    note.innerHTML = `
      ${lockIcon}
      <div>
        <span class="lesson-num">#${index + 1} ${lesson.cat}</span>
        <div class="lesson-title">${lesson.title}</div>
      </div>
      <div class="note-footer">
        <span><i class="fa-solid ${lesson.type === 'short' ? 'fa-mobile' : 'fa-play'}"></i> ${lesson.type}</span>
        <i class="fa-solid ${isUnlocked ? 'fa-arrow-right' : 'fa-lock'}"></i>
      </div>
    `;

    note.addEventListener("click", () => {
      if (isUnlocked) {
        window.location.href = `course.html?id=${lesson.id}`;
      } else {
        if (typeof showLockedModal === "function") {
          showLockedModal(lesson.title);
        } else {
          alert("Ye course locked hai. Pehle subscription activate karein.");
        }
      }
    });

    notesContainer.appendChild(note);
  });

  // Verify button for testing
  if (authBtn) {
    authBtn.addEventListener("click", () => {
      const email = userEmail.value.trim();
      if (!email) {
        alert("Email enter karein");
        return;
      }
      localStorage.setItem(CONFIG.STORAGE_KEY_STATUS, "active");
      localStorage.setItem(CONFIG.STORAGE_KEY_EMAIL, email);
      if (statusBadge) {
        statusBadge.className = "status-badge status-active";
        statusBadge.innerText = "Access Activated Successfully!";
        statusBadge.style.display = "block";
      }
      setTimeout(() => location.reload(), 500);
    });
  }
}

/* ---------------- PLAYER PAGE LOGIC ---------------- */
function initPlayerPage() {
  const isUnlocked = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";

  // Agar demo mode band hai aur access nahi hai tabhi rokega
  if (!isUnlocked) {
    alert("Unauthorized! Pehle subscription active karein.");
    window.location.href = "index.html";
    return;
  }

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
    const lesson = SAMPLE_LESSONS.find(l => l.id === id) || SAMPLE_LESSONS[0];
    if (!lesson) return;

    // Aspect Ratio auto adjust
    if (lesson.type === "short") {
      videoViewport.classList.remove("mode-long");
      videoViewport.classList.add("mode-short");
    } else {
      videoViewport.classList.remove("mode-short");
      videoViewport.classList.add("mode-long");
    }

    if (currentLessonTitle) currentLessonTitle.innerText = lesson.title;
    if (currentLessonCat) currentLessonCat.innerText = lesson.cat;

    // Helper se direct embed link set hoga
    videoPlayerFrame.src = getCleanEmbedUrl(lesson.url);
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
