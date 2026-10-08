/**
 * Course Controller - Fully Secured & Restored Modal Alert System
 */

const CONFIG = {
  // Production setting: False rakha hai taaki lock aur popup properly trigger hon
  DEMO_MODE: false, 
  STORAGE_KEY_TOKEN: "smc_device_token",
  STORAGE_KEY_EMAIL: "smc_user_email",
  STORAGE_KEY_STATUS: "smc_access_status"
};

// 7 Vibrant Note Color Classes
const NOTE_COLORS = ["c-green", "c-cyan", "c-pink", "c-yellow", "c-blue", "c-peach", "c-lavender"];

// Course Data (Pehla lesson Free Demo hai, baqi sab locked)
const LESSONS_DATA = [
  {
    id: "L001",
    cat: "Basics",
    title: "Stock Market Kya Hai? Complete Beginner Guide",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: true // FREE DEMO VIDEO
  },
  {
    id: "L002",
    cat: "Basics",
    title: "BSE aur NSE me kya antar hai?",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false
  },
  {
    id: "L003",
    cat: "Basics",
    title: "Demat aur Trading Account Open & Setup",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false
  },
  {
    id: "L004",
    cat: "Technical",
    title: "Support aur Resistance Levels draw karna",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false
  },
  {
    id: "L005",
    cat: "Candlestick",
    title: "Hammer aur Inverted Hammer Candlestick Strategy",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false
  },
  {
    id: "L006",
    cat: "Fundamental",
    title: "PE Ratio, PB Ratio aur Balance Sheet Analysis",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false
  },
  {
    id: "L007",
    cat: "F&O",
    title: "Options Trading: Call (CE) vs Put (PE) Basics",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false
  },
  {
    id: "L008",
    cat: "Psychology",
    title: "Trading Discipline aur Fear & Greed Control",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false
  }
];

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
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
}

function getOrCreateDeviceToken() {
  let token = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
  if (!token) {
    token = "dev_" + Math.random().toString(36).substring(2, 12);
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

/* ---------------- INDEX PAGE LOGIC ---------------- */
function initIndexPage(deviceToken) {
  const container = document.getElementById("notesContainer");
  const searchInput = document.getElementById("searchInput");
  const catFilter = document.getElementById("catFilter");
  const authBtn = document.getElementById("authBtn");
  const userEmail = document.getElementById("userEmail");
  const sendPlanRequestBtn = document.getElementById("sendPlanRequestBtn");
  const statusBadge = document.getElementById("statusBadge");
  const accessNotice = document.getElementById("accessNotice");
  const shareBtn = document.getElementById("shareBtn");

  let currentCategory = "All";
  let searchQuery = "";

  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";

  if (isUserActive && accessNotice) {
    accessNotice.innerText = "Status: Active (Unlocked)";
    accessNotice.style.color = "#10b981";
  }

  function renderGrid() {
    container.innerHTML = "";

    const filtered = LESSONS_DATA.filter(lesson => {
      const matchCat = (currentCategory === "All" || lesson.cat === currentCategory);
      const matchSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    filtered.forEach((lesson, index) => {
      const color = NOTE_COLORS[index % NOTE_COLORS.length];
      const note = document.createElement("div");
      note.className = `sticky-note ${color}`;

      const canPlay = isUserActive || lesson.isFree;

      // 4) Top-Right Corner 🔒 Lock Icon for paid lessons
      const cornerLock = canPlay 
        ? "" 
        : `<span class="corner-lock"><i class="fa-solid fa-lock"></i></span>`;

      // Status indicator at bottom
      const footerTag = lesson.isFree 
        ? `<span class="badge-free">FREE DEMO</span>` 
        : (isUserActive ? `<i class="fa-solid fa-play"></i>` : `<i class="fa-solid fa-lock" style="color:#475569;"></i>`);

      note.innerHTML = `
        ${cornerLock}
        <div>
          <span class="lesson-num">#${lesson.id} • ${lesson.cat}</span>
          <div class="lesson-title">${lesson.title}</div>
        </div>
        <div class="note-footer">
          <span></span>
          ${footerTag}
        </div>
      `;

      // B) Click Correction: Sirf free demo play hoga, baaki sab par POPUP aayega!
      note.addEventListener("click", () => {
        if (canPlay) {
          window.location.href = `course.html?id=${lesson.id}`;
        } else {
          showLockedModal(lesson.title);
        }
      });

      container.appendChild(note);
    });
  }

  // 2) Bina email ke button click karne par alert prompt
  authBtn.addEventListener("click", () => {
    const email = userEmail.value.trim();
    if (!email || !email.includes("@")) {
      alert("⚠️ Kripya apna registered email ID enter karein!");
      userEmail.focus();
      return;
    }

    authBtn.disabled = true;
    authBtn.innerText = "Checking...";

    setTimeout(() => {
      authBtn.disabled = false;
      authBtn.innerText = "Verify Access / Check Plan";

      // Mock status: Default "waiting" taaki payment manual verify ho
      const status = localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) || "waiting";

      if (status === "active") {
        statusBadge.className = "status-badge status-active";
        statusBadge.innerText = "Access Active! Sabhi lessons unlock hain.";
      } else {
        statusBadge.className = "status-badge status-waiting";
        statusBadge.innerText = "Payment verification pending. Manual approval ke baad unlock hoga.";
      }
      statusBadge.style.display = "block";
    }, 600);
  });

  // 1) Wapas aaya Manual Email Button handler
  sendPlanRequestBtn.addEventListener("click", () => {
    const email = userEmail.value.trim();
    if (!email) {
      alert("⚠️ Kripya apna email ID box me pehle likhein!");
      userEmail.focus();
      return;
    }

    const subject = encodeURIComponent("Share Market Course Activation Request");
    const body = encodeURIComponent(
      `Hello Admin,\n\nMaine course activate karne ke liye request bheji hai.\nEmail: ${email}\nDevice Token: ${deviceToken}\n\nKripya verification karke dashboard access chalu karein.`
    );
    window.location.href = `mailto:admin@example.com?subject=${subject}&body=${body}`;
  });

  // Live Search
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    renderGrid();
  });

  // Category Filter
  catFilter.addEventListener("click", (e) => {
    if (e.target.classList.contains("cat-chip")) {
      document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      currentCategory = e.target.getAttribute("data-cat");
      renderGrid();
    }
  });

  // Share Button
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Share Market Master Course",
            text: "300+ Chapters on Stock Market Basics, Technical Analysis & Candlesticks!",
            url: window.location.href
          });
        } catch (err) {}
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copy ho gaya hai!");
      }
    });
  }

  renderGrid();
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
  focusAuth();
}
function focusAuth() {
  const el = document.getElementById("authBox");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* ---------------- PLAYER PAGE LOGIC ---------------- */
function initPlayerPage() {
  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";

  const urlParams = new URLSearchParams(window.location.search);
  const activeId = urlParams.get("id") || LESSONS_DATA[0].id;

  const currentLesson = LESSONS_DATA.find(l => l.id === activeId) || LESSONS_DATA[0];

  // Agar user active nahi hai aur video free nahi hai toh rok do
  if (!isUserActive && !currentLesson.isFree) {
    alert("Unauthorized! Ye video locked hai.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("currentLessonTitle").innerText = currentLesson.title;

  const frame = document.getElementById("videoPlayerFrame");
  frame.src = getCleanEmbedUrl(currentLesson.url);

  // 3) White Theme List View Render
  const listContainer = document.getElementById("lessonList");
  const counter = document.getElementById("totalCounter");
  if (counter) counter.innerText = `${LESSONS_DATA.length} Topics`;

  listContainer.innerHTML = "";
  LESSONS_DATA.forEach((lesson, index) => {
    const li = document.createElement("li");
    li.className = `lesson-item ${lesson.id === activeId ? "active" : ""}`;

    const canAccess = isUserActive || lesson.isFree;

    li.innerHTML = `
      <i class="fa-solid ${canAccess ? (lesson.id === activeId ? 'fa-circle-play' : 'fa-play') : 'fa-lock'}" 
         style="font-size:0.8rem; color:${canAccess ? 'var(--primary)' : '#94a3b8'}"></i>
      <div style="flex:1; font-size:0.82rem;">
        <strong>#${index + 1}:</strong> ${lesson.title}
      </div>
      ${lesson.isFree ? '<span class="badge-free">FREE</span>' : ''}
    `;

    li.addEventListener("click", () => {
      if (canAccess) {
        window.location.href = `course.html?id=${lesson.id}`;
      } else {
        alert("Ye lesson locked hai. Pehle subscription active karein.");
      }
    });

    listContainer.appendChild(li);
  });
}
