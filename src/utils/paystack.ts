import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;
const CALLBACK_URL = process.env.FRONTEND_PAYSTACK_CALLBACK_URL as string;

export const initializePaystackPayment = async ({
  email,
  amount,
  currency,
  reference,
}: {
  email: string;
  amount: number; // in kobo for NGN
  currency: string;
  reference: string;
}) => {
  const url = "https://api.paystack.co/transaction/initialize";

  const response = await axios.post(
    url,
    {
      email,
      amount: amount * 100, // Paystack expects lowest currency unit (kobo)
      currency,
      reference,
      callback_url: CALLBACK_URL,
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data; // contains { status, message, data: { authorization_url, access_code, reference } }
};
