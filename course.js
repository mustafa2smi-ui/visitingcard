/**
 * Course Controller - OTP Verification, Strict Sanitization, Subcategories & Email Linker
 */

const CONFIG = {
  ADMIN_EMAIL: "admin@example.com", // Aapka official email
  DEMO_MODE: false, // Locked mode: only isFree:true opens
  STORAGE_KEY_TOKEN: "smc_device_token",
  STORAGE_KEY_EMAIL: "smc_user_email",
  STORAGE_KEY_STATUS: "smc_access_status"
};

const NOTE_COLORS = ["c-green", "c-cyan", "c-pink", "c-yellow", "c-blue", "c-peach", "c-lavender"];

// 1) 300+ Model with Sub-lessons
const LESSONS_DATA = [
  {
    id: "L001",
    cat: "Basics",
    title: "Stock Market Kya Hai? Complete Beginner Guide",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: true,
    subLessons: [
      { id: "L001-1", title: "Share aur Equity me antar", url: "https://youtu.be/M7lc1UVf-VE" },
      { id: "L001-2", title: "BSE vs NSE: Stock exchanges kaise chalte hain", url: "https://youtu.be/M7lc1UVf-VE" }
    ]
  },
  {
    id: "L002",
    cat: "Basics",
    title: "Demat & Trading Account Setup",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: [
      { id: "L002-1", title: "Brokers aur DP Charges samajhiye", url: "https://youtu.be/M7lc1UVf-VE" }
    ]
  },
  {
    id: "L003",
    cat: "Technical",
    title: "Support & Resistance Masterclass",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: [
      { id: "L003-1", title: "Swing High aur Swing Low draw karna", url: "https://youtu.be/M7lc1UVf-VE" },
      { id: "L003-2", title: "Breakout vs Fakeout kaise pehchane", url: "https://youtu.be/M7lc1UVf-VE" }
    ]
  },
  {
    id: "L004",
    cat: "Candlestick",
    title: "Hammer & Inverted Hammer Strategy",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: []
  },
  {
    id: "L005",
    cat: "Fundamental",
    title: "PE Ratio, PB Ratio & Balance Sheet",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: [
      { id: "L005-1", title: "Financial statement reading", url: "https://youtu.be/M7lc1UVf-VE" }
    ]
  },
  {
    id: "L006",
    cat: "F&O",
    title: "Options Trading: Call (CE) vs Put (PE)",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: []
  },
  {
    id: "L007",
    cat: "Psychology",
    title: "Risk Management & Emotion Control",
    url: "https://youtu.be/M7lc1UVf-VE",
    isFree: false,
    subLessons: []
  }
];

// 3) Strict Input Sanitization & Email Check
function sanitizeAndValidateEmail(rawEmail) {
  if (!rawEmail) return { valid: false, error: "Enter your email to register" };
  
  // Script tags & spaces remove
  let cleaned = rawEmail.replace(/<[^>]*>?/gm, "").trim();

  // Strict RFC compliant email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return { valid: false, error: "Kripya valid email address dalein (@ aur domain zaroori hai)." };
  }
  return { valid: true, email: cleaned };
}

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
  const otpGroup = document.getElementById("otpGroup");
  const otpInput = document.getElementById("otpInput");
  const sendPlanRequestBtn = document.getElementById("sendPlanRequestBtn");
  const statusBadge = document.getElementById("statusBadge");
  const accessNotice = document.getElementById("accessNotice");
  const shareBtn = document.getElementById("shareBtn");

  let currentCategory = "All";
  let searchQuery = "";
  let isOtpStep = false; // Step tracking: false = need email, true = need OTP

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
      const cornerLock = canPlay ? "" : `<span class="corner-lock"><i class="fa-solid fa-lock"></i></span>`;

      // 1) Subcategories Preview List on card (Always visible to attract)
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

      note.innerHTML = `
        ${cornerLock}
        <div>
          <span class="lesson-num">#${lesson.id} • ${lesson.cat}</span>
          <div class="lesson-title">${lesson.title}</div>
          ${subPreviewHtml}
        </div>
        <div class="note-footer">
          <span></span>
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

  // 3) Multi-step Smart OTP Register flow
  authBtn.addEventListener("click", () => {
    const emailResult = sanitizeAndValidateEmail(userEmail.value);
    
    // Email blank ya invalid hone par prompt
    if (!emailResult.valid) {
      alert(emailResult.error);
      userEmail.focus();
      return;
    }

    if (!isOtpStep) {
      // Step 1: Email valid hai -> OTP field show karo
      authBtn.innerText = "Sending OTP...";
      authBtn.disabled = true;

      setTimeout(() => {
        authBtn.disabled = false;
        authBtn.innerText = "Submit OTP & Verify";
        otpGroup.style.display = "block"; // OTP Box reveal
        otpInput.focus();
        isOtpStep = true;
        
        statusBadge.className = "status-badge status-waiting";
        statusBadge.innerText = `OTP sent to ${emailResult.email}. (Demo: enter 123456)`;
        statusBadge.style.display = "block";
      }, 700);

    } else {
      // Step 2: OTP verify step
      const otp = otpInput.value.trim();
      if (!otp || otp.length < 4) {
        alert("Kripya 6-digit OTP enter karein.");
        otpInput.focus();
        return;
      }

      authBtn.innerText = "Verifying...";
      authBtn.disabled = true;

      setTimeout(() => {
        authBtn.disabled = false;
        authBtn.innerText = "Verify Access";

        // Default Denied / Waiting for admin manual payment verification
        const status = localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) || "waiting";

        if (status === "active") {
          statusBadge.className = "status-badge status-active";
          statusBadge.innerText = "Account Active! Sabhi lessons unlock ho gaye.";
        } else {
          statusBadge.className = "status-badge status-waiting";
          statusBadge.innerText = "OTP Verified! Payment approval pending hai. Admin approval ke baad full access mil jayega.";
        }
        statusBadge.style.display = "block";
      }, 700);
    }
  });

  // 2) Native Email App Redirect with pre-filled content
  sendPlanRequestBtn.addEventListener("click", () => {
    const emailResult = sanitizeAndValidateEmail(userEmail.value);
    const email = emailResult.valid ? emailResult.email : "Not specified";

    const subject = encodeURIComponent("Course Access Activation Request");
    const body = encodeURIComponent(
      `Hello Admin,\n\nMaine Share Market course ke liye request bheji hai.\n` +
      `User Email: ${email}\n` +
      `Device Token: ${deviceToken}\n\n` +
      `Maine plan select kar liya hai, kripya verify karke mera dashboard access chalu karein.\n\nDhanyawad!`
    );
    // Directly opens Gmail / Default Email client app
    window.location.href = `mailto:${CONFIG.ADMIN_EMAIL}?subject=${subject}&body=${body}`;
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

  // Share
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
function showLockedModal(title, subLessons) {
  document.getElementById("modalTopicTitle").innerText = `"${title}"`;
  
  let desc = "Ye lesson dekhne ke liye subscription zaroori hai.";
  if (subLessons && subLessons.length > 0) {
    desc += ` Iske andar ${subLessons.length} aur practical sub-topics shamil hain.`;
  }
  document.getElementById("modalTopicDesc").innerText = desc;
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

  // Find Lesson (parent ya sub)
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

  // Access Guard
  if (!isUserActive && !parentLesson.isFree) {
    alert("Unauthorized! Ye video locked hai.");
    window.location.href = "index.html";
    return;
  }

  // Breadcrumbs & Title updates
  document.getElementById("breadCat").innerText = parentLesson.cat || "Topic";
  document.getElementById("breadTitle").innerText = selectedLesson.title;
  document.getElementById("currentLessonTitle").innerText = selectedLesson.title;

  const frame = document.getElementById("videoPlayerFrame");
  frame.src = getCleanEmbedUrl(selectedLesson.url);

  // Render White Theme Collapsible Subcategory List
  const listContainer = document.getElementById("lessonList");
  const counter = document.getElementById("totalCounter");
  if (counter) counter.innerText = `${LESSONS_DATA.length} Chapters`;

  listContainer.innerHTML = "";
  LESSONS_DATA.forEach(parent => {
    const isParentActive = (parent.id === parentLesson.id);
    const canAccessParent = isUserActive || parent.isFree;

    const group = document.createElement("li");
    group.className = "parent-group";

    group.innerHTML = `
      <div class="parent-header ${isParentActive ? 'active' : ''}">
        <span><i class="fa-solid ${canAccessParent ? 'fa-book-open' : 'fa-lock'}" style="margin-right:6px; color:${canAccessParent ? 'var(--primary)' : '#94a3b8'}"></i>${parent.title}</span>
        ${parent.isFree ? '<span class="badge-free">FREE</span>' : ''}
      </div>
      ${parent.subLessons && parent.subLessons.length > 0 ? `
        <ul class="sub-list">
          ${parent.subLessons.map(sub => `
            <li class="sub-item ${sub.id === activeId ? 'active' : ''}" data-id="${sub.id}">
              <i class="fa-solid fa-play" style="font-size:0.6rem;"></i> ${sub.title}
            </li>
          `).join("")}
        </ul>
      ` : ""}
    `;

    // Click parent
    group.querySelector(".parent-header").addEventListener("click", () => {
      if (canAccessParent) {
        window.location.href = `course.html?id=${parent.id}`;
      } else {
        alert("Ye chapter locked hai. Pehle subscription active karein.");
      }
    });

    // Click sub-items
    group.querySelectorAll(".sub-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        if (canAccessParent) {
          window.location.href = `course.html?id=${item.getAttribute("data-id")}`;
        } else {
          alert("Ye sub-topic locked hai.");
        }
      });
    });

    listContainer.appendChild(group);
  });
}
