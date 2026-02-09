const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');

let store;
let redis;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
  });

  redis.connect().then(() => {
    const RedisStore = require('rate-limit-redis');
    store = new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    });
    console.log('✅ Rate limiter using Redis store');
  }).catch(() => {
    console.warn('⚠️  Rate limiter using memory store (not suitable for multi-instance)');
  });
} catch (err) {
  console.warn('⚠️  Rate limiter using memory store (not suitable for multi-instance)');
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: store,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  },
  skip: (req) => req.path === '/health',
});

module.exports = limiter;
