const BASE_URL = "http://192.168.68.63:9001";

export interface SignUpPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  phone: string;
}

export interface SignUpResponse {
  error?: string;
  message?: string;
}

export async function signUpUser(payload: SignUpPayload): Promise<SignUpResponse> {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  let data: SignUpResponse | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Unexpected server response");
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Signup failed");
  }

  return data ?? {};
}