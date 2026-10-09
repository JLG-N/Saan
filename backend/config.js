const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || Buffer.byteLength(jwtSecret, "utf8") < 32) {
  throw new Error("JWT_SECRET must be configured with at least 32 bytes of random data.");
}

const config = {
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is not set. Configure it in the backend environment.");
}

if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN must be configured in production.");
}

module.exports = config;
