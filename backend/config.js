const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || Buffer.byteLength(jwtSecret, "utf8") < 32) {
  throw new Error("JWT_SECRET must be configured with at least 32 bytes of random data.");
}

const config = {
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret,
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is not set. Configure it in the backend environment.");
}

module.exports = config;
