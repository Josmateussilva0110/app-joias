import cron, { type ScheduledTask } from "node-cron"
import NotificationService from "../services/NotificationService"

let birthdayJob: ScheduledTask | null = null
let maintenanceJob: ScheduledTask | null = null
let isBirthdayJobRunning = false

export function startNotificationCronJobs() {
  if (birthdayJob || maintenanceJob) {
    return
  }

  birthdayJob = cron.schedule("* * * * *", async () => {
    if (isBirthdayJobRunning) {
      return
    }

    isBirthdayJobRunning = true

    try {
      const result = await NotificationService.runBirthdayNotificationJob()

      if (result.notificationsSent > 0) {
        console.log(
          `[BirthdayNotificationCron] sent=${result.notificationsSent} users=${result.usersProcessed}`
        )
      }
    } catch (error) {
      console.error("[BirthdayNotificationCron] job failed:", error)
    } finally {
      isBirthdayJobRunning = false
    }
  })

  maintenanceJob = cron.schedule("0 3 * * *", async () => {
    try {
      const result = await NotificationService.recalculateUtcOffsets()
      console.log(`[BirthdayNotificationCron] utc offsets recalculated=${result.updated}`)
    } catch (error) {
      console.error("[BirthdayNotificationCron] maintenance failed:", error)
    }
  })

  console.log("📬 Cron de notificações de aniversário iniciado")
}

export function stopNotificationCronJobs() {
  birthdayJob?.stop()
  maintenanceJob?.stop()
  birthdayJob = null
  maintenanceJob = null
}
