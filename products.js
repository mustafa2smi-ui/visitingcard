/* ========================================================
   MOONSTAR MALL - PRODUCT & SELLER DATABASE
   - sellerName: Agar likhenge to card par seller badge aayega.
   - allowCoupon: true/false (kisi specific product par discount band karne ke liye)
   - videoUrl: YouTube Link
   - imageUrl: ImgBB Link
   ======================================================== */

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
    videoUrl: "https://youtu.be/3JZ_D3ELwOQ"
  },
  {
    id: "MS03",
    title: "Sunset Projection Atmosphere LED Lamp",
    category: "Home Decor",
    price: 399,
    sellerName: "Star Handicrafts",
    allowCoupon: false, // Is product par discount code allow nahi hoga
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400"
  }
];
