import client from "./client";

// Creates a Stripe PaymentMethod on Stripe's servers using the publishable key.
// Raw card data never reaches our backend.
export const createStripePaymentMethod = async (card: {
  cvc: string;
  exp_month: string;
  exp_year: string;
  holder_name?: string;
  number: string;
}): Promise<string> => {
  const params = new URLSearchParams({
    "card[cvc]": card.cvc,
    "card[exp_month]": card.exp_month,
    "card[exp_year]": card.exp_year,
    "card[number]": card.number,
    "type": "card",
  });
  if (card.holder_name) {
    params.append("billing_details[name]", card.holder_name);
  }

  const res = await fetch("https://api.stripe.com/v1/payment_methods", {
    body: params.toString(),
    headers: {
      Authorization: `Bearer ${process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  const data = await res.json() as { error?: { message: string }; id?: string };

  if (!res.ok || !data.id) {
    throw new Error(data.error?.message ?? "Failed to create payment method");
  }

  return data.id;
};

export interface PaymentMethod {
  brand: string;
  created_at: string;
  exp_month: number;
  exp_year: number;
  holder_name: string | null;
  id: string;
  last4: string;
  stripe_payment_method_id: string;
  user_id: string;
}

export const createSetupIntent = async (): Promise<{
  client_secret: string;
  customer_id: string;
}> => {
  const { data } = await client.post("/payments/setup-intent");
  return data;
};

export const savePaymentMethod = async (payload: {
  holder_name?: string;
  payment_method_id: string;
}): Promise<PaymentMethod> => {
  const { data } = await client.post("/payments/payment-methods", payload);
  return data;
};

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const { data } = await client.get("/payments/payment-methods");
  return data.payment_methods;
};

export const deletePaymentMethod = async (id: string): Promise<void> => {
  await client.delete(`/payments/payment-methods/${id}`);
};
