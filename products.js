/* ========================================================
   JUGMUG MALL - SMART PRODUCT DATABASE
   - videoUrl: YouTube Link (watch / shorts / youtu.be)
   - imageUrl: ImgBB link (e.g. https://i.ibb.co/xyz/photo.jpg)
   - Agar kuch bhi na ho to auto placeholder emoji ban jayega!
   ======================================================== */

const PRODUCTS = [
  {
    id: "JM01",
    title: "Smart Multi-Functional Electric Cooking Pot",
    category: "Kitchen",
    price: 899,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    imageUrl: "https://i.ibb.co/68x9wGq/cooking-pot.jpg" // Dono available
  },
  {
    id: "JM02",
    title: "Wireless Mini Portable Car Vacuum Cleaner",
    category: "Gadgets",
    price: 649,
    videoUrl: "https://youtu.be/3JZ_D3ELwOQ" // Sirf YouTube link (Thumbnail auto aayega)
  },
  {
    id: "JM03",
    title: "Sunset Projection Atmosphere LED Lamp",
    category: "Home Decor",
    price: 399,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400" // Sirf Image Link
  },
  {
    id: "JM04",
    title: "Emergency Keychain LED Torch & Bottle Opener",
    category: "Gadgets",
    price: 199
    // Na video na image: Emoji & fallback text card banega (No crash!)
  }
];
