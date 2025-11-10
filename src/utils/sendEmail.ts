import formData from "form-data";
import Mailgun from "mailgun.js";
import type { MessagesSendResult } from "mailgun.js/definitions";

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY as string, // set in .env
});

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
): Promise<MessagesSendResult> => {
  try {
    const domain = process.env.MAILGUN_DOMAIN as string;
    console.log("📧 Using Mailgun domain:", domain);
    const data = {
      from: `HOSTEL MANAGEMENT <no-reply@${domain}>`,
      to,
      subject,
      html,
    };

    const response = await mg.messages.create(domain, data);
    return response;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
