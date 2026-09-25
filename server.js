const express = require("express");
const cors = require("cors");

require("./db"); // ensures tables exist before routes touch them

const authRoutes = require("./routes/auth");
const spotRoutes = require("./routes/spots");
const planRoutes = require("./routes/plans");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/spots", spotRoutes);
app.use("/api/plans", planRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Saan API listening on http://localhost:${PORT}`);
});
