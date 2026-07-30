import { requestData } from "./request";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  earnings_percent: number;
}

export interface UpdateProfileData {
  username: string;
}

export interface UpdateEarningsPercentData {
  earnings_percent: number;
}

export function getProfile() {
  return requestData<UserProfile>({
    endpoint: "/profile",
    method: "GET",
    withAuth: true,
  });
}

export function updateProfile(data: UpdateProfileData) {
  return requestData<UserProfile>({
    endpoint: "/profile",
    method: "PUT",
    data,
    withAuth: true,
  });
}

export function updateEarningsPercent(data: UpdateEarningsPercentData) {
  return requestData<UserProfile>({
    endpoint: "/profile/earnings-percent",
    method: "PATCH",
    data,
    withAuth: true,
  });
}
