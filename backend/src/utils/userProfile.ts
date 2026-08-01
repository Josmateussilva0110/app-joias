import { UserProfile } from "../types/users/profile"

type UserProfileRow = {
  id: string
  username: string
  email: string
  earnings_percent: number | null
}

export function mapUserProfileRow(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username ?? "",
    email: row.email,
    earnings_percent: row.earnings_percent ?? 100,
  }
}
