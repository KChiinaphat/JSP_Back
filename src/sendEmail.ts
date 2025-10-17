// sendEmail.ts
import { Resend } from "resend";

interface MailData {
  subject: string;
  text: string;
  html?: string;
}

// สร้าง instance Resend ด้วย API Key จาก environment
const resend = new Resend(process.env.RESEND_API_KEY!);

const sendEmail = async (data: MailData) => {
  try {
    const receiverEmail = process.env.EMAIL_RECEIVER!;
    if (!receiverEmail) {
      throw new Error("EMAIL_RECEIVER environment variable is not set");
    }

    await resend.emails.send({
      from: "JSP Website <onboarding@resend.dev>", // อีเมลผู้ส่ง
      to: receiverEmail,                             // ดึงจาก env
      subject: data.subject,
      text: data.text,
      html: data.html || data.text,
    });

    console.log(`Email sent to ${receiverEmail}`);
  } catch (error) {
    console.error("Send email failed:", error);
    throw error;
  }
};

export default sendEmail;
