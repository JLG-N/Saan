require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./db");

const SPOTS = [
  { id: "spot_001", name: "Amand Coffee Bar", category: "Café", address: "Villa Dolores Subd.", neighborhood: "Villa Dolores", avg_rating: 4.7, price_range: "$$", tagline: "Mediterranean holiday-inspired café surrounded by lush greenery.", tags: ["coffee date", "greenery", "slow afternoon"], image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_002", name: "Café Rooftop", category: "Café", address: "Fil-Am Friendship Hwy", neighborhood: "Friendship Hwy", avg_rating: 4.5, price_range: "$$", tagline: "Open-air café with sunset views, coffee, and casual bites.", tags: ["sunset", "open-air", "coffee"], image_url: "https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_003", name: "Café Fleur", category: "Café", address: "Santo Rosario", neighborhood: "Santo Rosario", avg_rating: 4.6, price_range: "$$", tagline: "Charming rustic café serving creative comfort food and specialty drinks.", tags: ["rustic", "brunch", "cozy"], image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_004", name: "Piña Kitchen & Coffee", category: "Café", address: "Angeles / Clark area", neighborhood: "Clark area", avg_rating: 4.1, price_range: "$", tagline: "Garden-style coffee stop with private dining nooks and creative drinks.", tags: ["private nook", "creative brews", "calm"], image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_005", name: "Nuan Café by Katrina’s", category: "Café", address: "Bacolor / Angeles border", neighborhood: "Bacolor border", avg_rating: 4.4, price_range: "$$", tagline: "Industrial-meets-greenery café with a resort-like, garden-inspired vibe.", tags: ["garden vibes", "resort", "photogenic"], image_url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_006", name: "Cottage Kitchen Cafe", category: "Café", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.5, price_range: "$$", tagline: "Laid-back café with jazz music and Cajun-inspired comfort bites.", tags: ["jazz", "comfort food", "easygoing"], image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_007", name: "25 Seeds by Chef Sau", category: "Restaurant", address: "Santo Rosario", neighborhood: "Santo Rosario", avg_rating: 4.4, price_range: "$$", tagline: "Elevated Kapampangan and fusion cuisine in a restored 1920s heritage mansion.", tags: ["heritage", "fusion", "special occasion"], image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_008", name: "Piccolo Padre", category: "Restaurant", address: "Balibago", neighborhood: "Balibago", avg_rating: 4.6, price_range: "$$$", tagline: "Renowned Italian fine dining with seafood, pasta, and romantic lighting.", tags: ["Italian", "seafood", "date night"], image_url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_009", name: "Rare Bar & Grill", category: "Restaurant", address: "Century Hotel, Balibago", neighborhood: "Balibago", avg_rating: 4.7, price_range: "$$$", tagline: "Upscale steakhouse known for dry-aged steaks and fine-dining service.", tags: ["steakhouse", "premium", "special occasion"], image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_010", name: "Sage by Ardesia", category: "Restaurant", address: "near Friendship Highway", neighborhood: "Friendship Hwy", avg_rating: 4.5, price_range: "$$", tagline: "Refined international dining for anniversary dinners and slow nights out.", tags: ["international", "anniversary", "elegant"], image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_011", name: "Amare by Chef Chris", category: "Restaurant", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.6, price_range: "$$$", tagline: "Brick-oven pizza, hand-crafted pasta, and intimate Italian ambience.", tags: ["Italian", "pizza", "romantic"], image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_012", name: "Bale Dutung", category: "Restaurant", address: "Villa Gloria", neighborhood: "Villa Gloria", avg_rating: 4.4, price_range: "$$$", tagline: "Chef Claude Tayag’s home-restaurant and multi-course Kapampangan degustation.", tags: ["Kapampangan", "degustation", "heritage"], image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_013", name: "Tito Boy by Chef Bong", category: "Restaurant", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.5, price_range: "$$", tagline: "Modern Filipino comfort food in a stylish, relaxed setting.", tags: ["Filipino", "comfort food", "modern"], image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_014", name: "Trattoria Altrove", category: "Restaurant", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.3, price_range: "$$", tagline: "Authentic wood-fired pizza and pasta in a warm, rustic interior.", tags: ["wood-fired", "pasta", "cozy"], image_url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_015", name: "Jiro Izakaya", category: "Restaurant", address: "Friendship Highway", neighborhood: "Friendship Hwy", avg_rating: 4.6, price_range: "$$$", tagline: "Japanese izakaya serving ramen, sushi, and yakitori with a lively mood.", tags: ["izakaya", "ramen", "late night"], image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_016", name: "Namari Japanese Bistro", category: "Restaurant", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.1, price_range: "$$", tagline: "Modern Japanese dining with sashimi, wagyu, and teppanyaki flair.", tags: ["Japanese", "sashimi", "teppanyaki"], image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_017", name: "Aranci Blu", category: "Restaurant", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.6, price_range: "$$", tagline: "Charming Italian eatery serving traditional pasta and regional dishes.", tags: ["Italian", "pasta", "authentic"], image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_018", name: "Smoki Moto", category: "Restaurant", address: "Clark Freeport", neighborhood: "Clark Freeport", avg_rating: 4.2, price_range: "$$$", tagline: "Premium Korean barbecue with elevated rooftop mountain views.", tags: ["KBBQ", "rooftop", "premium"], image_url: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_019", name: "Mila’s Tokwa’t Baboy", category: "Restaurant", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.4, price_range: "$", tagline: "Legendary Kapampangan spot famous for sisig and tokwa’t baboy.", tags: ["local favorite", "Kapampangan", "comfort"], image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_020", name: "Rustica", category: "Restaurant", address: "Friendship Highway", neighborhood: "Friendship Hwy", avg_rating: 4.3, price_range: "$$", tagline: "Casual family-style spot with a cozy wooden interior and all-day comfort food.", tags: ["family-style", "rustic", "casual"], image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_021", name: "Lucia’s Grill and Resto", category: "Restaurant", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.3, price_range: "$$", tagline: "Classic Filipino grills and hearty comfort dishes in a casual setting.", tags: ["Filipino", "grill", "comfort"], image_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_022", name: "Route 95", category: "Restaurant", address: "Friendship Highway", neighborhood: "Friendship Hwy", avg_rating: 4.2, price_range: "$$", tagline: "Retro diner serving gourmet burgers, pasta, and shakes.", tags: ["retro", "burgers", "diner"], image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_023", name: "Maranao Grill & Lounge", category: "Bar", address: "Century Park Hotel", neighborhood: "Century Park", avg_rating: 4.5, price_range: "$$$", tagline: "Elegant lounge with music, classic cocktails, and late-night energy.", tags: ["cocktails", "live music", "nightlife"], image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_024", name: "The Fireplace", category: "Bar", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.5, price_range: "$$$", tagline: "Speakeasy-style lounge and steakhouse for premium wine and cocktails.", tags: ["speakeasy", "wine bar", "premium"], image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_025", name: "Yats Wine Bar & Restaurant", category: "Bar", address: "Clark", neighborhood: "Clark", avg_rating: 4.8, price_range: "$$$", tagline: "Expanded wine cellar and curated spirit pairings for a polished night out.", tags: ["wine", "pairings", "upscale"], image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_026", name: "Koreatown Bar Street", category: "Bar", address: "Fil-Am Friendship Hwy", neighborhood: "Friendship Hwy", avg_rating: 4.4, price_range: "$$", tagline: "Vibrant nightlife strip for late-night pubs, pochas, and lounge bars.", tags: ["nightlife", "pub crawl", "late night"], image_url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_027", name: "L.A. Bakeshop", category: "Bakery", address: "San Fernando - nearby", neighborhood: "San Fernando", avg_rating: 4.7, price_range: "$", tagline: "Famous local bakery known for cheese-filled bread and Spanish bread.", tags: ["cheesebread", "pastry", "local favorite"], image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_028", name: "Teaspoon Desserts & Bakery", category: "Bakery", address: "Angeles City", neighborhood: "Angeles City", avg_rating: 4.6, price_range: "$$", tagline: "Cozy dessert shop with custom cakes, pastries, and sweet treats.", tags: ["desserts", "cakes", "sweet treats"], image_url: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_029", name: "Biblio", category: "Bookstore", address: "SM City Clark", neighborhood: "SM Clark", avg_rating: 4.5, price_range: "$", tagline: "Secondhand bookshop with vintage books, classics, and art prints.", tags: ["secondhand", "books", "quiet date"], image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80" },
  { id: "spot_030", name: "Fully Booked", category: "Bookstore", address: "NPO / Clark area", neighborhood: "Clark area", avg_rating: 4.6, price_range: "$$", tagline: "Sprawling bookstore for browsing literature, graphic novels, and stationery.", tags: ["bookstore", "literature", "stationery"], image_url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80" },
];

async function seed() {
  await db.query("ALTER TABLE spots ADD COLUMN IF NOT EXISTS tagline TEXT");
  await db.query("ALTER TABLE spots ADD COLUMN IF NOT EXISTS neighborhood TEXT");
  await db.query("ALTER TABLE spots ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[]");
  await db.query("ALTER TABLE spots ADD COLUMN IF NOT EXISTS image_url TEXT");

  const { rows } = await db.query("SELECT COUNT(*) AS n FROM spots");
  if (Number(rows[0].n) > 0) {
    console.log("Database already has data — skipping seed. Truncate the tables in Supabase to reset and reseed.");
    await db.end();
    return;
  }

  for (const s of SPOTS) {
    await db.query(
      "INSERT INTO spots (id, name, category, address, avg_rating, price_range, tagline, neighborhood, tags, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [s.id, s.name, s.category, s.address, s.avg_rating, s.price_range, s.tagline || null, s.neighborhood || null, s.tags || [], s.image_url || null]
    );
  }

  
  console.log("Seeded: 30 spots.");
  await db.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
