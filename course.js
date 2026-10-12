/**
 * SaralShareMarket - Complete Master Client Controller
 * Features: Dual Mode (Read Notes & Watch Video), Google Sheet Video API,
 * Dynamic SEO Injection, Single Device Security, Lightbox Reader & Modal Sync.
 */

const CONFIG = {
  // 1. Apna Google Apps Script Web App URL yahan paste karein
  APPS_SCRIPT_API_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",

  // 2. Official Admin Email
  ADMIN_EMAIL: "admin@example.com",

  // 3. Testing Switch: false = Production Secured, true = Demo Unlocked
  DEMO_MODE: false,

  // Local Storage Keys
  STORAGE_KEY_TOKEN: "ssm_device_token",
  STORAGE_KEY_EMAIL: "ssm_user_email",
  STORAGE_KEY_STATUS: "ssm_access_status"
};

// 7 Note Color Classes
const NOTE_COLORS = ["c-green", "c-cyan", "c-pink", "c-yellow", "c-blue", "c-peach", "c-lavender"];

// ==========================================================================
// 300+ LESSON DATA REPOSITORY
// ==========================================================================
const LESSONS_DATA = [
  {
    id: "L001",
    cat: "Basics",
    title: "Stock Market Kya Hai? Complete Beginner Guide",
    channelName: "CA Rachana Phadke Ranade",
    url: "https://youtu.be/M7lc1UVf-VE",
    start: 60,
    end: 300,
    isFree: true,
    subLessons: [
      { 
        id: "L001-1", 
        title: "Share aur Equity me antar kya hai?", 
        channelName: "CA Rachana Phadke Ranade",
        start: 310,
        end: 650
      }
    ]
  },
  {
    id: "L002",
    cat: "Basics",
    title: "Demat & Trading Account Setup aur Broker Charges",
    channelName: "Pranjal Kamra",
    url: "",
    start: 0,
    end: 0,
    isFree: false,
    subLessons: [
      { id: "L002-1", title: "Discount Brokers vs Full-Service Brokers", channelName: "Pranjal Kamra", start: 0, end: 0 }
    ]
  },
  {
    id: "L003",
    cat: "Technical",
    title: "Support & Resistance Masterclass: Key Levels",
    channelName: "Pushkar Raj Thakur",
    url: "",
    start: 0,
    end: 0,
    isFree: false,
    subLessons: [
      { id: "L003-1", title: "Swing High aur Swing Low draw karna", channelName: "Booming Bulls", start: 0, end: 0 },
      { id: "L003-2", title: "Breakout vs Fakeout kaise pehchanein", channelName: "Pushkar Raj Thakur", start: 0, end: 0 }
    ]
  },
  {
    id: "L004",
    cat: "Candlestick",
    title: "Hammer & Inverted Hammer Candlestick Strategy",
    channelName: "Booming Bulls",
    url: "",
    start: 0,
    end: 0,
    isFree: false,
    subLessons: []
  },
  {
    id: "L005",
    cat: "Fundamental",
    title: "PE Ratio, PB Ratio aur Balance Sheet Analysis",
    channelName: "Asset Yogi",
    url: "",
    start: 0,
    end: 0,
    isFree: false,
    subLessons: [
      { id: "L005-1", title: "Debt to Equity Ratio aur Free Cash Flow", channelName: "Asset Yogi", start: 0, end: 0 }
    ]
  },
  {
    id: "L006",
    cat: "F&O",
    title: "Options Trading Basics: Call (CE) vs Put (PE)",
    channelName: "Trading In The Zone",
    url: "",
    start: 0,
    end: 0,
    isFree: false,
    subLessons: []
  },
  {
    id: "L007",
    cat: "Psychology",
    title: "Trading Psychology: Fear, Greed & Position Sizing",
    channelName: "Power Of Stocks",
    url: "",
    start: 0,
    end: 0,
    isFree: false,
    subLessons: []
  }
];

// Demo filler agar list me kam data ho
if (LESSONS_DATA.length < 30) {
  for (let i = 8; i <= 35; i++) {
    LESSONS_DATA.push({
      id: `L0${i < 10 ? '0' + i : i}`,
      cat: i % 2 === 0 ? "Technical" : "Basics",
      title: `Stock Market Practical Strategy Lesson #${i}`,
      channelName: "Market Expert",
      url: "",
      start: 0,
      end: 0,
      isFree: false,
      subLessons: []
    });
  }
}

// ==========================================================================
// UTILITIES: Security & Device Fingerprint
// ==========================================================================

function sanitizeAndValidateEmail(rawEmail) {
  if (!rawEmail) return { valid: false, error: "Enter your email to register" };
  const cleaned = rawEmail.replace(/<[^>]*>?/gm, "").trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return { valid: false, error: "Kripya sahi format ka email daalein (jaise: name@example.com)." };
  }
  return { valid: true, email: cleaned };
}

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

  let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;

  if (startSec && Number(startSec) > 0) {
    embedUrl += `&start=${Math.floor(startSec)}`;
  }
  if (endSec && Number(endSec) > 0) {
    embedUrl += `&end=${Math.floor(endSec)}`;
  }

  return embedUrl;
}

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

  if (document.getElementById("notesContainer")) {
    initIndexPage(deviceToken);
  }

  if (document.getElementById("videoPlayerFrame")) {
    initPlayerPage();
  }
});

/* ==========================================================================
   INDEX PAGE CONTROLLER
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

  // Dynamic Learning Switcher Tabs
  const tabReadContent = document.getElementById("tabReadContent");
  const tabViewVideo = document.getElementById("tabViewVideo");

  // Lightbox Elements
  const readingLightbox = document.getElementById("readingLightbox");
  const closeLightboxBtn = document.getElementById("closeLightboxBtn");
  const prevSlideBtn = document.getElementById("prevSlideBtn");
  const nextSlideBtn = document.getElementById("nextSlideBtn");
  const slideCounter = document.getElementById("slideCounter");
  const slideBody = document.getElementById("slideBody");
  const lightboxTopicTitle = document.getElementById("lightboxTopicTitle");
  const lightboxTopicCat = document.getElementById("lightboxTopicCat");
  const lightboxScrollArea = document.getElementById("lightboxScrollArea");

  let currentCategory = "All";
  let searchQuery = "";
  let isOtpStep = false;
  let currentLearningMode = "read"; // 'read' ya 'video'
  let activeLightboxLesson = null;
  let activeSlideIndex = 0;

  let selectedPlanData = {
    name: "Monthly Pass (30 Days)",
    price: "₹499",
    days: "30"
  };

  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";

  // Dynamic Hero State Update
  const heroUnlockBtn = document.getElementById("heroUnlockBtn");
  const heroWelcomeBtn = document.getElementById("heroWelcomeBtn");
  const heroSubtext = document.getElementById("heroSubtext");

  if (isUserActive) {
    if (accessNotice) {
      accessNotice.innerHTML = `<i class="fa-solid fa-unlock"></i> Status: Active (Unlocked)`;
      accessNotice.style.color = "#10b981";
    }
    if (heroUnlockBtn) heroUnlockBtn.style.display = "none";
    if (heroWelcomeBtn) heroWelcomeBtn.style.display = "inline-flex";
    if (heroSubtext) heroSubtext.innerText = "✨ Aapka access active hai. Sabhi chapters khule hain.";
  } else {
    if (heroUnlockBtn) heroUnlockBtn.style.display = "inline-flex";
    if (heroWelcomeBtn) heroWelcomeBtn.style.display = "none";
  }

  // 1. Drawer Navigation Controls
  const openDrawerBtn = document.getElementById("openDrawerBtn");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerRefreshBtn = document.getElementById("drawerRefreshBtn");
  const installAppBtn = document.getElementById("installAppBtn");

  if (openDrawerBtn && drawerOverlay) {
    openDrawerBtn.addEventListener("click", () => drawerOverlay.classList.add("active"));
    if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", () => drawerOverlay.classList.remove("active"));
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

  // 2. Dual Mode Learning Tabs Toggle
  if (tabReadContent && tabViewVideo) {
    tabReadContent.addEventListener("click", () => {
      currentLearningMode = "read";
      tabReadContent.classList.add("active");
      tabViewVideo.classList.remove("active");
      renderGrid();
    });

    tabViewVideo.addEventListener("click", () => {
      currentLearningMode = "video";
      tabViewVideo.classList.add("active");
      tabReadContent.classList.remove("active");
      renderGrid();
    });
  }

  // 3. Pricing Selection Logic
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

  // 4. Dynamic SEO Injection
  function injectDynamicSeoSchema(lessonId, lessonData, readData) {
    let scriptTag = document.getElementById("dynamicLessonSchema");
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "dynamicLessonSchema";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const keywords = (readData && readData.keywords) ? readData.keywords : [lessonData.cat, "Stock Market Hindi"];
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      "name": lessonData.title,
      "educationalLevel": "Beginner to Advanced",
      "learningResourceType": currentLearningMode === "read" ? "Slide Notes / Article" : "Video Lecture",
      "keywords": keywords.join(", "),
      "provider": {
        "@type": "Organization",
        "name": "SaralShareMarket"
      }
    };
    scriptTag.text = JSON.stringify(schemaData);
  }

  // 5. Reading Lightbox Slider Engine
  function openReadingLightbox(lesson) {
    const readData = (typeof COURSE_READING_CONTENT !== 'undefined') ? COURSE_READING_CONTENT[lesson.id] : null;

    activeLightboxLesson = lesson;
    activeSlideIndex = 0;

    if (lightboxTopicTitle) lightboxTopicTitle.innerText = lesson.title;
    if (lightboxTopicCat) lightboxTopicCat.innerText = lesson.cat;

    renderCurrentSlide(readData);
    injectDynamicSeoSchema(lesson.id, lesson, readData);

    if (readingLightbox) readingLightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeReadingLightbox() {
    if (readingLightbox) readingLightbox.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  function renderCurrentSlide(readData) {
    if (!slideBody) return;

    if (!readData || !readData.slides || readData.slides.length === 0) {
      slideBody.innerHTML = `
        <div class="slide-headline" style="font-size:1.1rem; font-weight:800; color:#38bdf8; margin-bottom:0.6rem;">${activeLightboxLesson.title}</div>
        <div class="slide-text" style="font-size:0.85rem; color:#cbd5e1; line-height:1.6;">Is chapter ke theory notes jald hi yahan upload kar diye jayenge. Tab tak aap iska video lecture dekh kar padhai shuru kar sakte hain.</div>
      `;
      if (slideCounter) slideCounter.innerText = "Slide 1 / 1";
      if (prevSlideBtn) prevSlideBtn.disabled = true;
      if (nextSlideBtn) nextSlideBtn.disabled = true;
      return;
    }

    const slide = readData.slides[activeSlideIndex];
    if (slideCounter) slideCounter.innerText = `Slide ${activeSlideIndex + 1} / ${readData.slides.length}`;

    let imgHtml = slide.image ? `<img src="${slide.image}" class="slide-img-frame" alt="${slide.headline}">` : "";

    slideBody.innerHTML = `
      ${imgHtml}
      <div class="slide-headline" style="font-size:1.15rem; font-weight:800; color:#38bdf8; margin-bottom:0.7rem;">${slide.headline}</div>
      <div class="slide-text" style="font-size:0.88rem; color:#cbd5e1; line-height:1.7;">${slide.content}</div>
    `;

    if (prevSlideBtn) prevSlideBtn.disabled = (activeSlideIndex === 0);
    if (nextSlideBtn) nextSlideBtn.disabled = (activeSlideIndex === readData.slides.length - 1);
    if (lightboxScrollArea) lightboxScrollArea.scrollTop = 0;
  }

  if (prevSlideBtn) {
    prevSlideBtn.addEventListener("click", () => {
      const readData = (typeof COURSE_READING_CONTENT !== 'undefined') ? COURSE_READING_CONTENT[activeLightboxLesson.id] : null;
      if (activeSlideIndex > 0) {
        activeSlideIndex--;
        renderCurrentSlide(readData);
      }
    });
  }

  if (nextSlideBtn) {
    nextSlideBtn.addEventListener("click", () => {
      const readData = (typeof COURSE_READING_CONTENT !== 'undefined') ? COURSE_READING_CONTENT[activeLightboxLesson.id] : null;
      if (readData && activeSlideIndex < readData.slides.length - 1) {
        activeSlideIndex++;
        renderCurrentSlide(readData);
      }
    });
  }

  if (closeLightboxBtn) closeLightboxBtn.addEventListener("click", closeReadingLightbox);

  // Mobile Touch Swipe Handling
  let touchStartX = 0;
  let touchEndX = 0;
  if (lightboxScrollArea) {
    lightboxScrollArea.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxScrollArea.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      const readData = (typeof COURSE_READING_CONTENT !== 'undefined') ? COURSE_READING_CONTENT[activeLightboxLesson.id] : null;
      if (readData && Math.abs(diff) > 50) {
        if (diff < 0 && activeSlideIndex < (readData.slides.length - 1)) {
          activeSlideIndex++;
          renderCurrentSlide(readData);
        } else if (diff > 0 && activeSlideIndex > 0) {
          activeSlideIndex--;
          renderCurrentSlide(readData);
        }
      }
    }, { passive: true });
  }

  // Checkout Modal Trigger
  function triggerCheckoutModal() {
    if (typeof window.openCheckoutModal === "function") {
      window.openCheckoutModal();
    } else {
      const modal = document.getElementById("checkoutModal");
      if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }
  }

  // 6. Sticky Notes Grid Render
  function renderGrid() {
    if (!container) return;
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

      let subPreviewHtml = "";
      if (lesson.subLessons && lesson.subLessons.length > 0) {
        subPreviewHtml = `<ul class="subtopics-preview">
          ${lesson.subLessons.slice(0, 2).map(s => `<li>${s.title}</li>`).join("")}
          ${lesson.subLessons.length > 2 ? `<li>+${lesson.subLessons.length - 2} more...</li>` : ""}
        </ul>`;
      }

      const modeIcon = currentLearningMode === "read" 
        ? `<i class="fa-solid fa-book-open" style="font-size:0.75rem;"></i>` 
        : `<i class="fa-solid fa-play" style="font-size:0.75rem;"></i>`;

      const footerTag = lesson.isFree 
        ? `<span class="badge-free">FREE DEMO</span>` 
        : (isUserActive ? modeIcon : `<i class="fa-solid fa-lock" style="color:#94a3b8;"></i>`);

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

      // Card Click Handler
            note.addEventListener("click", () => {
        if (!canPlay) {
          triggerCheckoutModal();
          return;
        }

        if (currentLearningMode === "read") {
          // Direct Full-Page Reader par redirect karega
          window.location.href = `course-content.html?id=${lesson.id}`;
        } else {
          // Video player par redirect karega
          window.location.href = `course.html?id=${lesson.id}`;
        }
      });


      container.appendChild(note);
    });
  }

  // 7. Category Filter Event Listener
  if (catFilter) {
    catFilter.addEventListener("click", (e) => {
      const chip = e.target.closest(".cat-chip");
      if (chip) {
        document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        currentCategory = chip.getAttribute("data-cat") || "All";
        renderGrid();
      }
    });
  }

  // 8. Search Input Event Listener
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      renderGrid();
    });
  }

  // 9. OTP / Registration Flow
  if (authBtn) {
    authBtn.addEventListener("click", async () => {
      const emailResult = sanitizeAndValidateEmail(userEmail.value);
      if (!emailResult.valid) {
        alert(emailResult.error);
        userEmail.focus();
        return;
      }

      if (!isOtpStep) {
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
            if (otpGroup) otpGroup.style.display = "block";
            if (otpInput) otpInput.focus();
            isOtpStep = true;
            showStatusBadge(`OTP sent to ${emailResult.email}. (Spam folder check karein)`, "status-waiting");
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
          alert("Server connect nahi ho saka. Kripya punah prayas karein.");
        }

      } else {
        const otp = otpInput ? otpInput.value.trim() : "";
        if (!otp || otp.length < 4) {
          alert("Kripya valid 6-digit OTP daalein.");
          if (otpInput) otpInput.focus();
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
            authBtn.innerText = "Submit OTP & Verify";
            alert("Galti: " + data.message);
          }
        } catch (err) {
          authBtn.disabled = false;
          authBtn.innerText = "Submit OTP & Verify";
          alert("Verification server error. Dobara prayas karein.");
        }
      }
    });
  }

  // 10. Activation Request Mailer
  if (sendPlanRequestBtn) {
    sendPlanRequestBtn.addEventListener("click", () => {
      const emailResult = sanitizeAndValidateEmail(userEmail ? userEmail.value : "");
      const email = emailResult.valid ? emailResult.email : (localStorage.getItem(CONFIG.STORAGE_KEY_EMAIL) || "Not Specified");

      const subject = encodeURIComponent(`Activation Request: ${selectedPlanData.name}`);
      const body = encodeURIComponent(
        `Namaste Admin,\n\n` +
        `Maine SaralShareMarket par plan choose kiya hai:\n\n` +
        `----------------------------------------\n` +
        `Selected Plan : ${selectedPlanData.name}\n` +
        `Plan Price    : ${selectedPlanData.price}\n` +
        `Validity      : ${selectedPlanData.days} Days\n` +
        `User Email    : ${email}\n` +
        `Device Token  : ${deviceToken}\n` +
        `----------------------------------------\n\n` +
        `Mera UPI payment screenshot niche attach hai. Kripya access chalu karein.\n\nDhanyawad!`
      );
      window.location.href = `mailto:${CONFIG.ADMIN_EMAIL}?subject=${subject}&body=${body}`;
    });
  }

  // 11. Native Share API
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "SaralShareMarket | Curated Learning Roadmap",
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
    if (statusBadge) {
      statusBadge.className = `status-badge ${className}`;
      statusBadge.innerText = msg;
      statusBadge.style.display = "block";
    }
  }

  // Initial Grid Render on load
  renderGrid();
}

/* ==========================================================================
   COURSE PLAYER PAGE LOGIC
========================================================================== */
function initPlayerPage() {
  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";
  const activeEmail = localStorage.getItem(CONFIG.STORAGE_KEY_EMAIL) || "";
  const deviceToken = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN) || "";

  const userEmailDisplay = document.getElementById("userActiveEmail");
  if (userEmailDisplay) userEmailDisplay.innerText = activeEmail ? activeEmail : "Member";

  const urlParams = new URLSearchParams(window.location.search);
  const activeId = urlParams.get("id") || LESSONS_DATA[0].id;

  switchLessonInPlayer(activeId, isUserActive, activeEmail, deviceToken, false);
}

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

  if (pushHistory) {
    history.replaceState({ id: activeId }, selectedLesson.title, `course.html?id=${activeId}`);
  }

  const breadCat = document.getElementById("breadCat");
  const breadTitle = document.getElementById("breadTitle");
  const currentTitle = document.getElementById("currentLessonTitle");
  const creatorNameEl = document.getElementById("creatorName");

  if (breadCat) breadCat.innerText = parentLesson.cat || "Topic";
  if (breadTitle) breadTitle.innerText = selectedLesson.title;
  if (currentTitle) currentTitle.innerText = selectedLesson.title;
  if (creatorNameEl) creatorNameEl.innerText = selectedLesson.channelName || parentLesson.channelName || "Market Expert";

  renderPlaylistView(activeId, isUserActive, activeEmail, deviceToken);
  fetchVideoFromSheet(activeId, selectedLesson, isUserActive, activeEmail, deviceToken);
}

async function fetchVideoFromSheet(lessonId, lessonObj, isUserActive, email, token) {
  const frame = document.getElementById("videoPlayerFrame");
  const lockOverlay = document.getElementById("playerLockOverlay");

  if (!frame) return;
  frame.src = "about:blank";

  if (lessonObj.isFree) {
    if (lockOverlay) lockOverlay.style.display = "none";
    const startSec = lessonObj.start || 0;
    const endSec = lessonObj.end || 0;
    frame.src = getCleanEmbedUrl(lessonObj.url || "https://youtu.be/M7lc1UVf-VE", startSec, endSec);
    return;
  }

  if (!isUserActive) {
    if (lockOverlay) lockOverlay.style.display = "flex";
    return;
  }

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
              <span style="font-size:0.68rem; color:#94a3b8; font-weight:800;">${chapNumber}.${sIdx + 1}</span>
              <span style="flex:1;">${sub.title}</span>
              <i class="fa-solid fa-play" style="font-size:0.55rem; color:#38bdf8;"></i>
            </li>
          `).join("")}
        </ul>
      ` : ""}
    `;

    group.querySelector(".parent-header").addEventListener("click", () => {
      switchLessonInPlayer(parent.id, isUserActive, activeEmail, deviceToken, true);
    });

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
/* ==========================================================================
   FULL-PAGE CONTENT READER CONTROLLER (course-content.html)
========================================================================== */
function initContentReaderPage() {
  const isUserActive = CONFIG.DEMO_MODE || localStorage.getItem(CONFIG.STORAGE_KEY_STATUS) === "active";
  const urlParams = new URLSearchParams(window.location.search);
  const activeId = urlParams.get("id") || LESSONS_DATA[0].id;

  const drawerToggleBtn = document.getElementById("drawerToggleBtn");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerList = document.getElementById("drawerList");

  // Drawer Slide Open / Close (< and > Controls)
  if (drawerToggleBtn && drawerOverlay) {
    drawerToggleBtn.addEventListener("click", () => {
      drawerOverlay.classList.add("active");
    });
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener("click", () => {
        drawerOverlay.classList.remove("active");
      });
    }
    drawerOverlay.addEventListener("click", (e) => {
      if (e.target === drawerOverlay) drawerOverlay.classList.remove("active");
    });
  }

  // 1. Render Drawer Index List
  if (drawerList) {
    drawerList.innerHTML = "";
    LESSONS_DATA.forEach((item, index) => {
      const canAccess = isUserActive || item.isFree;
      const li = document.createElement("li");
      li.className = `drawer-item ${item.id === activeId ? 'active' : ''}`;
      
      const lockTag = item.isFree 
        ? `<span style="color:#10b981; font-size:0.65rem; font-weight:800;">FREE</span>` 
        : (canAccess ? `<i class="fa-solid fa-check" style="font-size:0.7rem; color:#38bdf8;"></i>` : `<i class="fa-solid fa-lock" style="font-size:0.7rem; color:#94a3b8;"></i>`);

      li.innerHTML = `
        <span style="font-size:0.68rem; color:#94a3b8; font-weight:800;">#${item.id}</span>
        <span class="drawer-item-title">${item.title}</span>
        ${lockTag}
      `;

      li.addEventListener("click", () => {
        window.location.href = `course-content.html?id=${item.id}`;
      });

      drawerList.appendChild(li);
    });
  }

  // 2. Load Active Lesson Data
  const currentLesson = LESSONS_DATA.find(l => l.id === activeId) || LESSONS_DATA[0];
  const readData = (typeof COURSE_READING_CONTENT !== 'undefined') ? COURSE_READING_CONTENT[currentLesson.id] : null;

  // Header & Breadcrumb Updates
  const pageTitle = document.getElementById("pageTitle");
  const breadCat = document.getElementById("breadCat");
  const breadTitle = document.getElementById("breadTitle");
  const topicCatBadge = document.getElementById("topicCatBadge");
  const lessonMainTitle = document.getElementById("lessonMainTitle");
  const videoSwitchBtn = document.getElementById("videoSwitchBtn");
  const articleBodyWrapper = document.getElementById("articleBodyWrapper");
  const contentLockScreen = document.getElementById("contentLockScreen");

  if (pageTitle) pageTitle.innerText = `${currentLesson.title} - Notes`;
  if (breadCat) breadCat.innerText = currentLesson.cat;
  if (breadTitle) breadTitle.innerText = currentLesson.title;
  if (topicCatBadge) topicCatBadge.innerText = currentLesson.cat;
  if (lessonMainTitle) lessonMainTitle.innerText = currentLesson.title;

  // Video Icon Route Set Karein
  if (videoSwitchBtn) {
    videoSwitchBtn.href = `course.html?id=${currentLesson.id}`;
  }

  // 3. Permission Check (Free vs Locked)
  const canRead = isUserActive || currentLesson.isFree;

  if (!canRead) {
    if (articleBodyWrapper) articleBodyWrapper.style.display = "none";
    if (contentLockScreen) contentLockScreen.style.display = "block";
    return;
  }

  // 4. Render Article Reading Cards
  if (articleBodyWrapper) {
    articleBodyWrapper.style.display = "flex";
    if (contentLockScreen) contentLockScreen.style.display = "none";
    articleBodyWrapper.innerHTML = "";

    if (!readData || !readData.slides || readData.slides.length === 0) {
      articleBodyWrapper.innerHTML = `
        <div class="reading-card">
          <h2><i class="fa-solid fa-circle-info"></i> Parichay</h2>
          <div class="reading-content-text">
            Is chapter ke vistarit notes jald hi upload kiye ja rahe hain. Tab tak aap upar diye gaye <strong>Watch Video</strong> button par click karke lecture dekh sakte hain.
          </div>
        </div>
      `;
      return;
    }

    readData.slides.forEach((slide) => {
      const card = document.createElement("div");
      card.className = "reading-card";

      const imgHtml = slide.image ? `<img src="${slide.image}" class="slide-media-frame" alt="${slide.headline}">` : "";

      card.innerHTML = `
        <h2><i class="fa-solid fa-book-bookmark"></i> ${slide.headline}</h2>
        ${imgHtml}
        <div class="reading-content-text">${slide.content}</div>
      `;

      articleBodyWrapper.appendChild(card);
    });
  }
}
