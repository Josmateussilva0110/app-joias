import { Router } from "express"
import NotificationController from "../controllers/notificationController"
import { authMiddleware } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { RegisterPushTokenSchema } from "../schemas/registerPushTokenSchema"
import { UpdateNotificationSettingsSchema } from "../schemas/updateNotificationSettingsSchema"

const router = Router()

router.post(
  "/notifications/register-token",
  authMiddleware,
  validate(RegisterPushTokenSchema),
  NotificationController.registerToken
)

router.delete(
  "/notifications/register-token",
  authMiddleware,
  NotificationController.removeToken
)

router.get(
  "/notifications/settings",
  authMiddleware,
  NotificationController.getSettings
)

router.put(
  "/notifications/settings",
  authMiddleware,
  validate(UpdateNotificationSettingsSchema),
  NotificationController.updateSettings
)

export default router
