require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./db"); // connects to Supabase Postgres; routes assume the schema.sql tables already exist

const authRoutes = require("./routes/auth");
const spotRoutes = require("./routes/spots");
const planRoutes = require("./routes/plans");
const sharedRoutes = require("./routes/shared");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/spots", spotRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/shared", sharedRoutes); // public, read-only

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Saan API listening on http://localhost:${PORT}`);
});
