import { requestData } from "./request";
import { PROFILE_ROUTES } from "@/config/api-routes";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  earnings_percent: number;
  must_change_password: boolean;
}

export interface UpdateProfileData {
  username: string;
}

export interface UpdateEarningsPercentData {
  earnings_percent: number;
}

export interface ChangePasswordData {
  current_password?: string;
  new_password: string;
  confirm_password: string;
}

export function getProfile() {
  return requestData<UserProfile>({
    endpoint: PROFILE_ROUTES.profile,
    method: "GET",
    withAuth: true,
  });
}

export function updateProfile(data: UpdateProfileData) {
  return requestData<UserProfile>({
    endpoint: PROFILE_ROUTES.profile,
    method: "PUT",
    data,
    withAuth: true,
  });
}

export function changePassword(data: ChangePasswordData) {
  return requestData<UserProfile>({
    endpoint: PROFILE_ROUTES.password,
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
