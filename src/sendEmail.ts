import nodemailer from 'nodemailer';

interface MailData {
  subject: string;
  text: string;
  html?: string;
}

const sendEmail = async (to: string, data: MailData) => {
  const transporter = nodemailer.createTransport({
  host: process.env.STMP_HOST || 'stmp.gmail.com' ,
  port:Number(process.env.STMP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: `"JSPWEBSITE" <${process.env.SMTP_USER}>`,
    to,
    subject: data.subject,
    text: data.text,
    html: data.html || data.text
  });
};

export default sendEmail;
