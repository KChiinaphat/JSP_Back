import express, { Application } from 'express';
import cors from 'cors';
import userRoutes from './routes/user';
import authRoutes from './routes/auth'; 
import productRoutes from './routes/product';
import contractroutes from './routes/Contract';
import certificateRoutes from './routes/certificate';
import ProjectRoutes from './routes/Project';
import { connectDB } from './config/db';

const app: Application = express();

// ✅ Middleware (ต้องมาก่อน route ใดๆ)
app.use(cors({
  origin: ['https://jspmetalwork.com'], // อนุญาตให้เว็บนี้เรียกได้
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

// ✅ Route ทดสอบหลัง cors
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// ✅ Connect to MongoDB
connectDB();

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/contract', contractroutes);
app.use('/api/projects', ProjectRoutes);

export default app;
