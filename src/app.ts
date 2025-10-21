import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import userRoutes from './routes/user';
import authRoutes from './routes/auth'; 
import productRoutes from './routes/product';
import contractRoutes from './routes/Contract';
import certificateRoutes from './routes/certificate';
import projectRoutes from './routes/Project';
import { connectDB } from './config/db';

const app: Application = express();

// CORS
const allowedOrigins = ['https://jspmetalwork.com'];
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/contract', contractRoutes);
app.use('/api/projects', projectRoutes);

export default app; // ✅ default export จำเป็นถ้าใช้ server.ts
