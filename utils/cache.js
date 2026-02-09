const Redis = require('ioredis');

let redis = null;
let redisAvailable = false;

try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('⚠️  Redis unavailable - caching disabled');
        return null;
      }
      return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.connect().then(() => {
    redisAvailable = true;
    console.log('✅ Redis connected');
  }).catch(() => {
    console.warn('⚠️  Redis unavailable - caching disabled');
    redisAvailable = false;
  });

  redis.on('error', (err) => {
    redisAvailable = false;
    console.error('Redis error:', err.message);
  });
  
  redis.on('connect', () => {
    redisAvailable = true;
  });
} catch (err) {
  console.warn('⚠️  Redis initialization failed - caching disabled');
}

const cache = {
  get: async (key) => {
    if (!redisAvailable || !redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Cache get error:', err.message);
      return null;
    }
  },
  
  set: async (key, value, ttl = process.env.CACHE_TTL || 3600) => {
    if (!redisAvailable || !redis) return;
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (err) {
      console.error('Cache set error:', err.message);
    }
  },
  
  del: async (key) => {
    if (!redisAvailable || !redis) return;
    try {
      await redis.del(key);
    } catch (err) {
      console.error('Cache del error:', err.message);
    }
  }
};

module.exports = cache;
