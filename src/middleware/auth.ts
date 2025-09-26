import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// กำหนด interface สำหรับ payload ใน JWT ที่เราสร้างจาก login
interface JwtPayload {
  _id: string;
  role: string;
}

// กำหนด type ของ request ที่จะมี user ฝังอยู่จาก token
interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Middleware: ตรวจสอบว่า token ถูกต้องไหม
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = decoded; // _id และ role จะถูกฝังมาจากตอน login
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware: ตรวจสอบว่า role เป็น admin หรือไม่
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
