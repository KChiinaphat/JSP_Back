import express, { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloundinary";
import Project from "../models/project";
import { authenticate, isAdmin } from "../middleware/auth";
import sharp from "sharp";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('รองรับเฉพาะไฟล์ jpeg และ png เท่านั้น'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router: Router = express.Router();

// ✅ ฟังก์ชันอัปโหลดขึ้น Cloudinary พร้อมรักษาความโปร่งใสของ PNG
const uploadToCloudinary = async (file: Express.Multer.File) => {
  let resizeBuffer;

  if (file.mimetype === 'image/png') {
    // 🔹 ถ้าเป็น PNG → ใช้ sharp().png() เพื่อคง transparency
    resizeBuffer = await sharp(file.buffer)
      .resize({ width: 800 })
      .png({ compressionLevel: 8 })
      .toBuffer();
  } else {
    // 🔹 ถ้าเป็น JPEG → บีบอัดแบบปกติ
    resizeBuffer = await sharp(file.buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  const format = file.mimetype.split('/')[1];
  const base64Str = resizeBuffer.toString('base64');
  const dataUri = `data:image/${format};base64,${base64Str}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'projects',
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

// ✅ สร้างโปรเจกต์ใหม่
router.post('/', authenticate, isAdmin, upload.array('images', 5), async (req, res) => {
  console.log('✅ [POST] called');
  console.log('📦 Request Body:', req.body);

  const { name, description, location, category } = req.body;

  if (!name || !description || !location || !category) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
  }

  const allowedCategories = ['ตู้พาเนล', 'ตู้เฟรม'];
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ message: 'ประเภทต้องเป็นตู้พาเนลหรือตู้เฟรมเท่านั้น' });
  }

  try {
    const files = req.files as Express.Multer.File[] || [];
    const uploadedImages = await Promise.all(files.map(file => uploadToCloudinary(file)));

    const newProject = new Project({
      name,
      description,
      location,
      category,
      images: uploadedImages,
    });

    const savedProject = await newProject.save();

    console.log('✅ Project saved successfully:', savedProject);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('🔥 Error saving project:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกโปรเจกต์' });
  }
});

// ✅ ดึงโปรเจกต์ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter: any = {};

    if (category) {
      if (!['ตู้พาเนล', 'ตู้เฟรม'].includes(category as string)) {
        return res.status(400).json({ message: 'Category ไม่ถูกต้อง' });
      }
      filter.category = category;
    }

    const projects = await Project.find(filter);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error });
  }
});

// ✅ ดึงโปรเจกต์ตาม ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project by ID', error });
  }
});

// ✅ แก้ไขโปรเจกต์
router.put('/:id', authenticate, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { category } = req.body;

    if (category && !['ตู้พาเนล', 'ตู้เฟรม'].includes(category)) {
      return res.status(400).json({ message: 'กรุณาระบุ category ให้ถูกต้อง' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // ลบรูปเก่าจาก Cloudinary
    for (const img of project.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    // อัปโหลดรูปใหม่
    const files = req.files as Express.Multer.File[] || [];
    const images = await Promise.all(files.map(file => uploadToCloudinary(file)));

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images },
      { new: true }
    );

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: 'Error updating project', error });
  }
});

// ✅ ลบโปรเจกต์
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // ลบรูปทั้งหมดใน Cloudinary
    for (const img of project.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

export default router;
