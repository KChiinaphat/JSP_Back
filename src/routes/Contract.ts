import { Router, Request, Response } from 'express';
import Contact from '../models/contract';
import sendEmail from '../sendEmail';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  if (!req.body.firstName || !req.body.email) {
    return res.status(400).json({ success: false, message: "กรอกข้อมูลไม่ครบ" });
  }

  try {
    const newContract = new Contact(req.body);
    await newContract.save();

    await sendEmail({
      subject: 'มีคนติดต่อผ่านเว็บไซต์',
      text: `
ชื่อ: ${req.body.firstName} ${req.body.lastName}
หัวข้อ: ${req.body.subject || '-'}
อีเมล: ${req.body.email}
เบอร์โทร: ${req.body.phone}
บริษัท: ${req.body.company || '-'}
      `,
    });

    res.status(201).json({ success: true, message: 'ส่งข้อมูลเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการส่งข้อมูล' });
  }
});

export default router;
