// lib/api.ts
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}

export async function registerUser(payload: RegisterPayload) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: payload.fullName,
        email: payload.email,
        password: payload.password,
        phone: payload.phoneNumber,
        address: payload.address,
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Registration failed");
  }

  return res.json();
}
