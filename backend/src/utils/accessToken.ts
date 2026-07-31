import jwt from "jsonwebtoken"

import { env } from "../config/env"

export function getUserIdFromAccessToken(accessToken: string): string | undefined {
  try {
    const payload = jwt.verify(accessToken, env.SUPABASE_JWT_SECRET, {
      algorithms: ["HS256"],
    }) as { sub?: string }

    return payload.sub
  } catch {
    const payload = jwt.decode(accessToken) as { sub?: string } | null
    return payload?.sub
  }
}
