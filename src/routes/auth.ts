// routes/auth.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const loginlimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 5, // จำกัด 5 ครั้งใน 15 นาที
  message: 'ลองล็อกอินมากเกินไป โปรดลองใหม่ในอีก 15 นาที',
});

router.get('/test', (req, res) => {
  res.send('Auth route works');
});

router.post('/login',loginlimit ,async (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try { 
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('Found user:', { id: user._id, role: user.role }); // Debug log

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    console.log('User role before response:', user.role);


    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Debug log before sending response
    console.log('Sending response:', { token: token.substring(0, 20) + '...', role: user.role });

    
    res.json({
      token,
      role: user.role,
      userId: user._id,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
