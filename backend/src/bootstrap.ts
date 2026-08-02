import { initRedis, closeRedis } from "./database/redis/redis"
import { initRateLimitStore } from "./utils/rateLimitStore"
import { startNotificationCronJobs, stopNotificationCronJobs } from "./jobs/birthdayNotificationCron"

export async function bootstrapInfrastructure(): Promise<void> {
  await initRedis()
  await initRateLimitStore()
  startNotificationCronJobs()
}

export async function shutdownInfrastructure(): Promise<void> {
  stopNotificationCronJobs()
  await closeRedis()
}

export { closeRedis }
