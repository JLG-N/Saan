require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { port, corsOrigin } = require("./config");

require("./db");

const authRoutes = require("./routes/auth");
const spotRoutes = require("./routes/spots");
const planRoutes = require("./routes/plans");
const sharedRoutes = require("./routes/shared");

const app = express();

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || origin === corsOrigin);
  },
}));
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/spots", spotRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/shared", sharedRoutes);

app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large." });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(port, () => {
  console.log(`Saan API listening on http://localhost:${port}`);
});
