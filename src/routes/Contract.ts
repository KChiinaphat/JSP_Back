import { Router, Request, Response } from 'express';
import Contact from '../models/contract';
import sendEmail from '../sendEmail';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { firstName, lastName, email, subject, phone, company } = req.body;

  if (!firstName || !email) {
    return res.status(400).json({ success: false, message: "กรอกข้อมูลไม่ครบ" });
  }

  try {
    // บันทึกลง MongoDB
    const newContact = new Contact(req.body);
    await newContact.save();

    // ส่งอีเมล
    await sendEmail(process.env.COMPANY_EMAIL || '', {
      subject: 'มีคนติดต่อผ่านเว็บไซต์',
      text: `
ชื่อ: ${firstName} ${lastName || '-'}
หัวข้อ: ${subject || '-'}
อีเมล: ${email}
เบอร์โทร: ${phone || '-'}
บริษัท: ${company || '-'}
      `,
    });

    res.status(201).json({ success: true, message: 'ส่งข้อมูลเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการส่งข้อมูล' });
  }
});

export default router;
