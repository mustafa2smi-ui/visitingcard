// 🗓️ Islamic History Events (Hijri Date format: "Day-Month")
// Months: Muharram, Safar, RabiulAwwal, RabiulAkhir, JamadilAwwal, JamadilAkhir, Rajab, Shaban, Ramadan, Shawwal, Zulqadah, Zulhijjah
const islamicHistoryData = [
  {
    hijriDate: "24-Safar",
    year: "1 Hijri",
    title: "Hijrat-e-Madina Ka Ba-barkat Safar",
    summary: "Nabi Kareem ﷺ aur Hazrat Abu Bakr Siddique (R.A) ne Ghar-e-Saur se Madina Munawwarah ki taraf hijrat ka safar aaghaz farmaya.",
    tag: "Seerat"
  },
  {
    hijriDate: "12-RabiulAwwal",
    year: "1 Hijri",
    title: "Quba Me Pehli Masjid Ki Tameer",
    summary: "Nabi Akram ﷺ Madina ke qareeb basti Quba me dakhil hue aur Masjid-e-Quba ki buniyaad rakhi.",
    tag: "Tareekh"
  },
    {
    hijriDate: "25-RabiulAwwal",
    year: "1 Hijri",
    title: "Demo",
    summary: "Demo",
    tag: "Tareekh"
  },
  {
    hijriDate: "17-Ramadan",
    year: "2 Hijri",
    title: "Ghazwa-e-Badr",
    summary: "Haq aur baatil ka pehla ma'raka jisme 313 musalmano ko azeem fatah naseeb hui.",
    tag: "Ghazwa"
  }
];

// 📖 100+ Common Quranic & Daily Arabic Words
const arabicWordsData = [
  { word: "رَحْمَة", trans: "Rahmah", en: "Mercy", ur: "رحمت", hi: "दया / रहमत" },
  { word: "شُكْر", trans: "Shukr", en: "Gratitude", ur: "شکر گزاری", hi: "आभार / कृतज्ञता" },
  { word: "صَبْر", trans: "Sabr", en: "Patience", ur: "صبر و برداشت", hi: "धैर्य / सब्र" },
  { word: "عِلْم", trans: "Ilm", en: "Knowledge", ur: "علم و آگہی", hi: "ज्ञान / विद्या" },
  { word: "قَلْب", trans: "Qalb", en: "Heart", ur: "دل", hi: "हृदय / दिल" },
  { word: "نُور", trans: "Noor", en: "Light", ur: "روشنی / نور", hi: "दिव्य प्रकाश / नूर" },
  { word: "سَلَام", trans: "Salam", en: "Peace", ur: "سلامتی", hi: "शांति / सलामती" },
  { word: "حَقّ", trans: "Haqq", en: "Truth", ur: "سچائی / حق", hi: "सत्य / हक" },
  { word: "ذِكْر", trans: "Zikr", en: "Remembrance", ur: "یاد / چرچا", hi: "स्मरण / याद" },
  { word: "تَوْبَة", trans: "Tawbah", en: "Repentance", ur: "استغفار و توبہ", hi: "पश्चाताप / तौबा" },
  { word: "بَرَكَة", trans: "Barakah", en: "Blessing", ur: "برکت", hi: "बरकत / सौभाग्य" },
  { word: "عَدْل", trans: "Adl", en: "Justice", ur: "انصاف", hi: "न्याय / इंसाफ" },
  { word: "إِحْسَان", trans: "Ihsan", en: "Excellence", ur: "نیکی و احسان", hi: "परोपकार / भलाई" },
  { word: "تَقْوَى", trans: "Taqwa", en: "God-Consciousness", ur: "پرہیزگاری", hi: "ईश्वर-भय / संयम" },
  { word: "هُدَى", trans: "Huda", en: "Guidance", ur: "ہدایت", hi: "मार्गदर्शन / हिदायत" }
];
// ads card
const allSponsorsDatabase = [
  // 1. Sirf Poster Banner Wala Ad (WhatsApp direct click)
  {
    id: 1,
    isActive: true, // 👈 true = Show hoga | false = Deactivate ho jayega (delete karne ki zaroorat nahi)
    tier: "premium",
    imageUrl: "https://i.ibb.co/RkHMfVk4/562359697234.jpg",
    whatsapp: "919876543210",
    // Poster mode me baaqi sab khali chhod sakte hain:
    title: "",
    category: "",
    description: "",
    badgeText: "",
    videoUrl: "",
    instagramUrl: "",
    actionBtnText: ""
  },

  // 2. Full Text Card (YouTube + Instagram icons ke sath)
  {
    id: 2,
    isActive: true,
    tier: "premium",
    imageUrl: "", // Blank = Text Card Mode
    title: "Maktabah Noor Islamic Books",
    category: "Islamic Bookstore",
    description: "Authentic deeni kitabein aur bachhon ke liye Islamic books par special 20% discount.",
    badgeText: "⭐ Premium Partner",
    videoUrl: "https://youtu.be/fiEsee1ShGA",
    instagramUrl: "https://instagram.com/maktabahnoor",
    whatsapp: "919876543211",
    actionBtnText: "📚 Order on WhatsApp"
  },

  // 3. Deactivated Ad Ka Example (Card show nahi hoga)
  {
    id: 3,
    isActive: false, // 👈 Band kar diya, data safe rahega
    tier: "standard",
    imageUrl: "",
    title: "Madrasa Faiz-ul-Uloom Appeal",
    category: "Charity / Madrasa",
    description: "Yateem talaba ki imdad ke liye apne sadqaat jama karein.",
    badgeText: "Verified Trust",
    whatsapp: "919876543212",
    actionBtnText: "🤝 Contact Madrasa"
  }
];
// videos
const islamicVideosDatabase = [
  {
    url: "https://youtube.com/shorts/tZ4oiYkR1X0?si=N5pAgo-1n_Y-8GdN",
    fallbackTitle: "" // Agar auto fetch fail hua to yeh aayega
  },
  {
    url: "https://youtu.be/e96Ud-3wzQc?si=fr67EYi2sg3ROpoZ", // Shorts link bhi chalega
    fallbackTitle: ""
  },
  {
    url: "https://youtu.be/_WzX0SA1hEw?si=Iv_kK_0DJDX2YO5t",
    fallbackTitle: ""
  },
  {
    url: "https://youtu.be/C3sUuSyeiwA?si=XCvmsxz-bOXCAaEp",
    fallbackTitle: ""
  },
  {
    url: "https://youtu.be/_zZmKMac8wE?si=RJC9MYnAQewdzMVh",
    fallbackTitle: "Seerat-un-Nabi Short"
  },
  {
    url: "https://youtu.be/fiEsee1ShGA?si=fGY5bi19u6gsxTya",
    fallbackTitle: ""
  }
];
