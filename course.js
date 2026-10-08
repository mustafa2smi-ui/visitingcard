/**
 * Course Controller - Structured Sub-lessons, Color Palettes & Filters
 */

const CONFIG = {
  DEMO_MODE: true, // Test ke liye true, real locked ke liye false
  STORAGE_KEY_TOKEN: "smc_device_token",
  STORAGE_KEY_EMAIL: "smc_user_email",
  STORAGE_KEY_STATUS: "smc_access_status"
};

// 7 Vibrant Note Color Classes
const NOTE_COLORS = ["c-green", "c-cyan", "c-pink", "c-yellow", "c-blue", "c-peach", "c-lavender"];

// 9 & 10) Category-wise 300+ Model with Sub-lessons & Free Demo flags
const LESSONS_DATA = [
  {
    id: "L001",
    cat: "Basics",
    title: "Stock Market Kya Hai? Complete Beginner Guide",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: true, // 2) FREE DEMO VIDEO
    subLessons: [
      { id: "L001-1", title: "Share aur Equity kya hoti hai?", url: "https://youtu.be/M7lc1UVf-VE" },
      { id: "L001-2", title: "BSE aur NSE exchanges kaise operate karte hain?", url: "https://youtu.be/M7lc1UVf-VE" }
    ]
  },
  {
    id: "L002",
    cat: "Basics",
    title: "Demat aur Trading Account Open & Setup",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: []
  },
  {
    id: "L003",
    cat: "Technical",
    title: "Support aur Resistance Levels draw karna",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: [
      { id: "L003-1", title: "Major Swing High aur Low identify karna", url: "https://youtu.be/M7lc1UVf-VE" }
    ]
  },
  {
    id: "L004",
    cat: "Candlestick",
    title: "Hammer aur Inverted Hammer Candlestick Strategy",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: []
  },
  {
    id: "L005",
    cat: "Fundamental",
    title: "PE Ratio, PB Ratio aur Balance Sheet Analysis",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: []
  },
  {
    id: "L006",
    cat: "F&O",
    title: "Options Trading: Call (CE) vs Put (PE) Basics",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: []
  },
  {
    id: "L007",
    cat: "Psychology",
    title: "Trading Discipline aur Fear & Greed Control",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: []
  }
];

// Helper: YouTube Direct Share link to Embed URL
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
  // Anti-redirect & branding params
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("notesContainer")) {
    initIndexPage();
  }
  if (document.getElementById("videoPlayerFrame")) {
    initPlayerPage();
  }
});

/* ---------------- INDEX PAGE ---------------- */
function initIndexPage() {
  const container = document.getElementById("notesContainer");
  const searchInput = document.getElementById("searchInput");
  const catFilter = document.getElementById("catFilter");
  const shareBtn = document.getElementById("shareBtn");

  let currentCategory = "All";
  let searchQuery = "";

  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";

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

      const isPlayable = isUserActive || lesson.isFree;
      const statusIcon = isPlayable 
        ? (lesson.isFree ? `<span class="badge-free">FREE DEMO</span>` : `<i class="fa-solid fa-play"></i>`)
        : `<i class="fa-solid fa-lock lock-tag"></i>`;

      note.innerHTML = `
        <div>
          <span class="lesson-num">#${lesson.id} ${lesson.cat}</span>
          <div class="lesson-title">${lesson.title}</div>
        </div>
        <div class="note-footer">
          <span>${lesson.subLessons.length > 0 ? `<i class="fa-solid fa-list-ul"></i> +${lesson.subLessons.length}` : ''}</span>
          ${statusIcon}
        </div>
      `;

      note.addEventListener("click", () => {
        if (isPlayable) {
          window.location.href = `course.html?id=${lesson.id}`;
        } else {
          showLockedModal(lesson.title);
        }
      });

      container.appendChild(note);
    });
  }

  // 4) Live Search Filter
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    renderGrid();
  });

  // 10) Category Tabs Filter
  catFilter.addEventListener("click", (e) => {
    if (e.target.classList.contains("cat-chip")) {
      document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      currentCategory = e.target.getAttribute("data-cat");
      renderGrid();
    }
  });

  // 5) Web Share API
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Share Market Master Course",
            text: "300+ Best stock market lectures in Hindi. Dekho zero se advanced trading setup!",
            url: window.location.href
          });
        } catch (err) { /* Share canceled */ }
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied! Apne doston ke sath share karein.");
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
  document.getElementById("authBox").scrollIntoView({ behavior: "smooth" });
}

/* ---------------- PLAYER PAGE ---------------- */
function initPlayerPage() {
  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";

  const urlParams = new URLSearchParams(window.location.search);
  const activeId = urlParams.get("id") || LESSONS_DATA[0].id;

  // Selected lesson find karo (chahe parent ho ya sub-lesson)
  let selectedLesson = LESSONS_DATA.find(l => l.id === activeId);
  let parentLesson = selectedLesson;

  if (!selectedLesson) {
    // Agar sub-lesson click hua ho
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

  // Free Demo check
  if (!isUserActive && !parentLesson.isFree) {
    alert("Unauthorized! Pehle subscription activate karein.");
    window.location.href = "index.html";
    return;
  }

  // Update Breadcrumbs & Titles
  document.getElementById("breadCat").innerText = parentLesson.cat || "Topic";
  document.getElementById("breadTitle").innerText = selectedLesson.title;
  document.getElementById("currentLessonTitle").innerText = selectedLesson.title;

  // Load video
  const frame = document.getElementById("videoPlayerFrame");
  frame.src = getCleanEmbedUrl(selectedLesson.url);

  // Render Sub-lesson Playlist
  const playlist = document.getElementById("lessonList");
  playlist.innerHTML = "";

  LESSONS_DATA.forEach(parent => {
    const li = document.createElement("li");
    li.className = "parent-item";

    const isCurrentParent = (parent.id === parentLesson.id);
    li.innerHTML = `
      <div class="parent-header ${isCurrentParent ? 'active' : ''}">
        <span>${parent.title}</span>
        ${parent.isFree ? '<span class="badge-free">FREE</span>' : ''}
      </div>
      ${parent.subLessons.length > 0 ? `
        <ul class="sub-list">
          ${parent.subLessons.map(sub => `
            <li class="sub-item ${sub.id === activeId ? 'active' : ''}" onclick="window.location.href='course.html?id=${sub.id}'">
              <i class="fa-solid fa-play" style="font-size:0.6rem; margin-right:4px;"></i> ${sub.title}
            </li>
          `).join('')}
        </ul>
      ` : ''}
    `;

    li.querySelector(".parent-header").addEventListener("click", () => {
      window.location.href = `course.html?id=${parent.id}`;
    });

    playlist.appendChild(li);
  });
}
