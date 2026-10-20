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
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));


export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis Connected ✅");
    }
}




