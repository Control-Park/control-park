import client from "./client";
import { supabase } from "../utils/supabase";

export interface UserProfile {
  address_city: null | string;
  address_country: null | string;
  address_line1: null | string;
  address_line2: null | string;
  address_postal_code: null | string;
  address_state: null | string;
  birth_date: string;
  created_at: string;
  email: string;
  first_name: string;
  host: boolean;
  host_display_name: null | string;
  id: string;
  last_name: string;
  phone: null | string;
  preferred_name: null | string;
  role: string;
  updated_at: string;
}

export const fetchUserById = async (id: string): Promise<UserProfile> => {
  const { data } = await client.get(`/auth/user/${id}`);
  return data as UserProfile;
};

export const getMyProfile = async (): Promise<UserProfile> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;

  if (!userId) {
    throw new Error("No authenticated user");
  }

  const { data } = await client.get(`/auth/user/${userId}`);
  return data as UserProfile;
};

export const updateMyProfile = async (updates: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at" | "email">>): Promise<UserProfile> => {
  const { data } = await client.patch("/auth/me", updates);
  return data as UserProfile;
};

// Step 1: sends OTP to current email
export const requestEmailChange = async (new_email: string): Promise<void> => {
  await client.post("/auth/email-change/request", { new_email });
};

// Step 2: verifies current email OTP, triggers OTP to new email
export const verifyCurrentEmail = async (otp: string): Promise<void> => {
  await client.post("/auth/email-change/verify-current", { otp });
};

// Step 3: verifies new email OTP and finalises the change
export const verifyNewEmail = async (otp: string): Promise<void> => {
  await client.post("/auth/email-change/verify-new", { otp });
};

export const requestPasswordChange = async (email: string): Promise<void> => {
  await client.post("/auth/forgot-password", { email });
};

export const changePassword = async (email: string, otp: string, new_password: string): Promise<void> => {
  await client.post("/auth/change-password", { email, new_password, otp });
};
