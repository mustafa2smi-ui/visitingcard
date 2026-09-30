/* ========================================================
   MOONSTAR MALL - PRODUCT & SELLER DATABASE
   - sellerName: Agar likhenge to card par seller badge aayega.
   - allowCoupon: true/false (kisi specific product par discount band karne ke liye)
   - videoUrl: YouTube Link
   - imageUrl: ImgBB Link
   ======================================================== */
/*
const PRODUCTS = [
  {
    id: "MS01",
    title: "Smart Multi-Functional Electric Cooking Pot",
    category: "Kitchen",
    price: 899,
    sellerName: "MoonStar Official", // Aapka apna product
    allowCoupon: true,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400"
  },
  {
    id: "MS02",
    title: "Wireless Mini Portable Car Vacuum Cleaner",
    category: "Gadgets",
    price: 649,
    sellerName: "Royal Traders", // Dusre businessman ka product (Seller Badge aayega)
    allowCoupon: true,
    videoUrl: "https://youtube.com/shorts/JYS6vsFtFVo?si=JErLk1843By78zJJ"
  },
  {
    id: "MS03",
    title: "Sunset Projection Atmosphere LED Lamp",
    category: "Home Decor",
    price: 399,
    sellerName: "Star Handicrafts",
    allowCoupon: false, // Is product par discount code allow nahi hoga
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    videoUrl: "https://youtu.be/MgeLnmzExCc?si=4gdHQG1axQvGMmFz"
  }
];
*/
const PRODUCTS = [
  // 1. Single Product (Pehle jaisa hi rahega)
  {
    id: "MS101",
    title: "Mini Portable Sealer",
    category: "Gadgets",
    price: 299,
    sellerName: "MoonStar Official",
    allowCoupon: true,
    videoUrl: "https://youtube.com/shorts/AbCdEfGh123",
    imageUrl: ""
  },

  // 2. Multi-Product Combo (Top 3 / Top 5 Video)
  {
    id: "MS102",
    title: "Top 3 Kitchen Cleaning Hacks Gadgets",
    category: "Kitchen",
    sellerName: "Royal Traders",
    videoUrl: "https://youtube.com/shorts/JYS6vsFtFVo?si=JErLk1843By78zJJ",
    imageUrl: "",
    items: [
      { id: "MS102-1", title: "Automatic Bottle Washer", price: 349, allowCoupon: true, timeSec: 0 },
      { id: "MS102-2", title: "Silicone Dish Scrubber (Pack of 3)", price: 199, allowCoupon: true, timeSec: 15 },
      { id: "MS102-3", title: "Oil Spray Dispenser Bottle", price: 279, allowCoupon: false, timeSec: 32 }
    ]
  }
];
