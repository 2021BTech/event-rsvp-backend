import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const data = await resend.emails.send({
      from: `Event RSVP <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully", data);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};
