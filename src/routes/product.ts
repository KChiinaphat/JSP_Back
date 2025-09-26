import express, { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloundinary';
import Product, { IProduct } from '../models/product';
import { authenticate, isAdmin } from '../middleware/auth';
import sharp from 'sharp';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('รองรับเฉพาะไฟล์ JPEG และ PNG เท่านั้น'));
    }
    cb(null, true);
  },
  limits: { fileSize: 20  * 1024 * 1024 }, // 20MB
});

const router: Router = express.Router();

const uploadToCloudinary = async (file: Express.Multer.File) => {
  
  let resizedBuffer;
let dataUri;

if (file.mimetype === 'image/png') {
  // แปลง PNG โปร่งใสเป็น PNG
  resizedBuffer = await sharp(file.buffer)
    .resize({ width: 800 })
    .png({ compressionLevel: 7, adaptiveFiltering: true }) // compressionLevel 0-9
    .toBuffer();

  const base64Str = resizedBuffer.toString('base64');
  dataUri = `data:image/png;base64,${base64Str}`;
} else {
  // แปลง JPEG
  resizedBuffer = await sharp(file.buffer)
    .resize({ width: 800 })
    .jpeg({ quality: 70 })
    .toBuffer();

  const base64Str = resizedBuffer.toString('base64');
  dataUri = `data:image/jpeg;base64,${base64Str}`;
}

const result = await cloudinary.uploader.upload(dataUri, {
  folder: 'products',
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
});


  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};


router.post('/', authenticate, isAdmin, upload.array('images', 20), async (req, res) => {
  try {
    const { category, price: priceStr } = req.body;

    if (!category || !['ตู้พาเนล', 'ตู้เฟรม'].includes(category)) {
      return res.status(400).json({ message: 'กรุณาระบุ category เป็น ตู้พาเนล หรือ ตู้เฟรม' });
    }

    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      return res.status(400).json({ message: 'ราคาต้องเป็นตัวเลข' });
    }

    const files = req.files as Express.Multer.File[];
    const images = await Promise.all(files.map(file => uploadToCloudinary(file)));

    const product = new Product({
      ...req.body,
      price,
      images,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: 'Error creating product', error });
  }
});


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

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product by ID', error });
  }
});


router.put('/:id', authenticate, isAdmin, upload.array('images', 20), async (req, res) => {
  try {
    const { category } = req.body;

    if (category && !['ตู้พาเนล', 'ตู้เฟรม' ].includes(category)) {
      return res.status(400).json({ message: 'กรุณาระบุ category ให้ถูกต้อง' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // ลบรูปเดิมจาก Cloudinary
    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    // อัปโหลดรูปใหม่
    const files = req.files as Express.Multer.File[];
    const images = await Promise.all(files.map(file => uploadToCloudinary(file)));

    // อัปเดตข้อมูล
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
});


router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
});

export default router;
