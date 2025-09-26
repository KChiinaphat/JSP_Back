import express, { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloundinary';
import Certificate from '../models/certificate';
import { authenticate, isAdmin } from '../middleware/auth';

const router: Router = express.Router();

// ตั้งค่า Multer สำหรับจัดการไฟล์
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF, JPEG, and PNG files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 10MB
});
// ✅ [GET] ดึงข้อมูลใบรับรองทั้งหมด หรือกรองตาม category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    const filter: any = {};
    if (category) {
      filter.category = category;
    }

    const certificates = await Certificate.find(filter);
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ message: 'Error fetching certificates', error });
  }
});

// ✅ [POST] อัปโหลดใบรับรอง
router.post('/', authenticate, isAdmin, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, category } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files.file || !title || !category) {
      return res.status(400).json({ message: 'กรอกข้อมูลไม่ครบ' });
    }

    // อัพโหลดไฟล์ PDF
    const pdfUploadPromise = new Promise<{ url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'certificates',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          resource_type: 'raw',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed'));
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      );
      uploadStream.end(files.file[0].buffer);
    });

    // อัพโหลด logo ถ้ามี
    let logoData = null;
    if (files.logo) {
      const logoUploadPromise = new Promise<{ url: string; public_id: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'certificates/logos',
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Cloudinary upload failed'));
            } else {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          }
        );
        uploadStream.end(files.logo[0].buffer);
      });

      try {
        logoData = await logoUploadPromise;
      } catch (error) {
        console.error('Logo upload error:', error);
        return res.status(500).json({ message: 'Logo upload failed', error });
      }
    }

    try {
      const pdfData = await pdfUploadPromise;
      const certificate = new Certificate({
        name: title,
        url: pdfData.url,
        public_id: pdfData.public_id,
        category: category,
        logo: logoData
      });

      await certificate.save();
      res.status(201).json({ 
        success: true, 
        message: 'อัปโหลดใบประกาศสำเร็จ', 
        certificate 
      });
    } catch (err) {
      console.error('Error saving certificate:', err);
      res.status(500).json({ message: 'Error saving certificate', error: err });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});
// ✅ [DELETE] ลบใบรับรองตาม ID
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'ไม่พบใบประกาศนี้' });
    }

    // ถ้ามี public_id ของ logo และไฟล์ PDF ให้ลบออกจาก Cloudinary ด้วย
    const deletePromises = [];

    if (cert.public_id) {
      deletePromises.push(
        cloudinary.uploader.destroy(cert.public_id, { resource_type: 'raw' })
      );
    }

    if (cert.logo?.public_id) {
      deletePromises.push(
        cloudinary.uploader.destroy(cert.logo.public_id, { resource_type: 'image' })
      );
    }

    await Promise.all(deletePromises);

    res.status(200).json({ success: true, message: 'ลบใบประกาศเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดขณะลบ', error });
  }
});




export default router;
