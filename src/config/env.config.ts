/**
 * Application environment configuration factory.
 * Loads and validates environment variables for the entire application.
 * Used by ConfigModule to provide type-safe configuration access.
 *
 * @returns {object} Configuration object with application settings
 * @property {number} port - Server port number (default: 3000)
 * @property {string} nodeEnv - Application environment (development/production/test)
 * @property {object} database - Database configuration
 * @property {string} database.url - PostgreSQL connection URL
 * @property {object} jwt - JWT authentication configuration
 * @property {string} jwt.secret - Secret key for JWT signing
 * @property {string} jwt.expiresIn - Token expiration time (e.g., '24h', '1h')
 */
export const envConfig = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
});
