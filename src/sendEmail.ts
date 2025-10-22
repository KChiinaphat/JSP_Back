import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";

interface MailData {
  subject: string;
  text: string;
  html?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY!);

const sendEmail = async (to: string, data: MailData) => {
  try {
    const email = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to,
      subject: data.subject,
      html: data.html || `<p>${data.text}</p>`,
    });
    console.log("ส่งเมลสำเร็จ:", email);
  } catch (err) {
    console.error("ส่งเมลล้มเหลว:", err);
    throw err;
  }
};

export default sendEmail;
