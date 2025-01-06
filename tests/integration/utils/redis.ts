import Redis from 'ioredis'

let redisClient: Redis

export async function startRedis() {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  return redisClient
}

export async function stopRedis() {
  if (redisClient) {
    await redisClient.quit()
  }
}

export async function clearRedis() {
  if (redisClient) {
    await redisClient.flushall()
  }
}