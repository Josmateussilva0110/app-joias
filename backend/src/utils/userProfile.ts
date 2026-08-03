import { UserProfile } from "../types/users/profile"

type UserProfileRow = {
  id: string
  username: string
  email: string
  earnings_percent: number | null
  must_change_password: boolean | null
}

export function mapUserProfileRow(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username ?? "",
    email: row.email,
    earnings_percent: row.earnings_percent ?? 100,
    must_change_password: row.must_change_password ?? false,
  }
}
