import { createClient } from 'redis';
import { envVars } from './env';

const isCloud = envVars.REDIS_HOST && !envVars.REDIS_HOST.includes('127.0.0.1') && !envVars.REDIS_HOST.includes('localhost');

export const redisClient = createClient({
    username: envVars.REDIS_USERNAME || 'default',
    password: envVars.REDIS_PASSWORD || undefined,
    socket: {
        host: envVars.REDIS_HOST,
        port: Number(envVars.REDIS_PORT) || 6379,
        // Upstash / cloud Redis needs TLS, local Docker does not
        ...(isCloud && { tls: true as const }),
        connectTimeout: 5000,
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));


export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('Redis Connected ✅');
        }
    } catch (err) {
        // Redis unavailable — server will still start.
        // OTP features will fail gracefully per-request.
        console.warn('⚠️  Redis connection failed (OTP features disabled):', (err as Error).message);
    }
};

/**
 * Serverless (Vercel) environments don't persist connections between requests.
 * Call this before any Redis operation to ensure the client is connected.
 */
export const ensureRedisConnected = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};




