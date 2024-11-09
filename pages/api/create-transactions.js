import { snap } from "@/utils/midtrans";

export default async function handler(req, res) {
  // Log untuk debugging
  console.log("API Route hit:", req.method);
  console.log("Request body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      orderId,
      amount,
      productName,
      firstName,
      lastName,
      email,
      phoneNumber,
      finish_redirect_url,
    } = req.body;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phoneNumber,
      },
      callbacks: {
        finish: finish_redirect_url,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    console.log("Transaction created:", transaction);

    return res.status(200).json({
      status: "success",
      token: transaction.token,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Error creating transaction",
    });
  }
}
