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

function seed() {
  const spotCount = db.prepare("SELECT COUNT(*) AS n FROM spots").get().n;
  if (spotCount > 0) {
    console.log("Database already has data — skipping seed. Delete saan.db to reset and reseed.");
    return;
  }

  const insertSpot = db.prepare(
    "INSERT INTO spots (id, name, category, address, avg_rating, price_range) VALUES (@id, @name, @category, @address, @avg_rating, @price_range)"
  );
  const insertMany = db.transaction((rows) => rows.forEach((r) => insertSpot.run(r)));
  insertMany(SPOTS);

  // demo account so the app is runnable immediately: demo@saan.app / password123
  const demoId = "user_demo";
  db.prepare("INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)").run(
    demoId,
    "demo@saan.app",
    bcrypt.hashSync("password123", 10),
    "Jane Doe"
  );

  const demoPlanId = "plan_demo1";
  db.prepare("INSERT INTO plans (id, title, user_id, status) VALUES (?, ?, ?, 'ready')").run(
    demoPlanId,
    "Saturday Coffee Crawl",
    demoId
  );
  const insertPlanSpot = db.prepare(
    "INSERT INTO plan_spots (id, plan_id, spot_id, order_index) VALUES (?, ?, ?, ?)"
  );
  insertPlanSpot.run("ps_demo1", demoPlanId, "spot_001", 0);
  insertPlanSpot.run("ps_demo2", demoPlanId, "spot_002", 1);
  insertPlanSpot.run("ps_demo3", demoPlanId, "spot_003", 2);

  db.prepare("INSERT INTO reviews (id, spot_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)").run(
    "rev_demo1",
    "spot_001",
    demoId,
    5,
    "Best oat milk latte in town, quiet enough to work."
  );

  console.log("Seeded: 12 spots, 1 demo user (demo@saan.app / password123), 1 plan, 1 review.");
}

seed();
