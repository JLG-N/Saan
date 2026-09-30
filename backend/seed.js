require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./db");

const SPOTS = [
  { id: "spot_001", name: "Blue Door Café", category: "Café", address: "142 Elm St", avg_rating: 4.2, price_range: "$$" },
  { id: "spot_002", name: "Riverside Bakery", category: "Bakery", address: "58 River Rd", avg_rating: 4.6, price_range: "$" },
  { id: "spot_003", name: "Park Bench Books", category: "Bookstore", address: "9 Maple Ave", avg_rating: 4.4, price_range: "$" },
  { id: "spot_004", name: "The Copper Kettle", category: "Café", address: "220 Union St", avg_rating: 4.0, price_range: "$$" },
  { id: "spot_005", name: "Salt & Vine", category: "Restaurant", address: "77 Harbor Blvd", avg_rating: 4.7, price_range: "$$$" },
  { id: "spot_006", name: "Noodle House 88", category: "Restaurant", address: "310 5th Ave", avg_rating: 4.3, price_range: "$$" },
  { id: "spot_007", name: "The Rusty Anchor", category: "Bar", address: "12 Dockside Way", avg_rating: 4.1, price_range: "$$" },
  { id: "spot_008", name: "Moonlight Rooftop Bar", category: "Bar", address: "500 Skyline Dr", avg_rating: 4.5, price_range: "$$$" },
  { id: "spot_009", name: "Green Leaf Tea House", category: "Café", address: "34 Willow Ln", avg_rating: 4.3, price_range: "$" },
  { id: "spot_010", name: "Fork & Flame", category: "Restaurant", address: "88 Central Ave", avg_rating: 4.6, price_range: "$$$" },
  { id: "spot_011", name: "Sunday Morning Diner", category: "Restaurant", address: "15 Baker St", avg_rating: 4.0, price_range: "$" },
  { id: "spot_012", name: "The Reading Room", category: "Café", address: "601 Oak St", avg_rating: 4.4, price_range: "$$" },
];

async function seed() {
  const { rows } = await db.query("SELECT COUNT(*) AS n FROM spots");
  if (Number(rows[0].n) > 0) {
    console.log("Database already has data — skipping seed. Truncate the tables in Supabase to reset and reseed.");
    await db.end();
    return;
  }

  for (const s of SPOTS) {
    await db.query(
      "INSERT INTO spots (id, name, category, address, avg_rating, price_range) VALUES ($1, $2, $3, $4, $5, $6)",
      [s.id, s.name, s.category, s.address, s.avg_rating, s.price_range]
    );
  }

  // demo account so the app is runnable immediately: demo@saan.app / password123
  const demoId = "user_demo";
  await db.query(
    "INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4)",
    [demoId, "demo@saan.app", bcrypt.hashSync("password123", 10), "Gab"]
  );

  const demoPlanId = "plan_demo1";
  await db.query(
    "INSERT INTO plans (id, title, user_id, status) VALUES ($1, $2, $3, 'ready')",
    [demoPlanId, "Saturday Coffee Crawl", demoId]
  );

  const planSpots = [
    ["ps_demo1", demoPlanId, "spot_001", 0],
    ["ps_demo2", demoPlanId, "spot_002", 1],
    ["ps_demo3", demoPlanId, "spot_003", 2],
  ];
  for (const [id, planId, spotId, orderIndex] of planSpots) {
    await db.query(
      "INSERT INTO plan_spots (id, plan_id, spot_id, order_index) VALUES ($1, $2, $3, $4)",
      [id, planId, spotId, orderIndex]
    );
  }

  await db.query(
    "INSERT INTO reviews (id, spot_id, user_id, rating, comment) VALUES ($1, $2, $3, $4, $5)",
    ["rev_demo1", "spot_001", demoId, 5, "Best oat milk latte in town, quiet enough to work."]
  );

  console.log("Seeded: 12 spots, 1 demo user (demo@saan.app / password123), 1 plan, 1 review.");
  await db.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
