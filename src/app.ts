// server.ts
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

// --------------------
// CORS Middleware
// --------------------
const allowedOrigins = ['https://jspmetalwork.com'];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // อนุญาตถ้า origin อยู่ใน whitelist หรือไม่มี origin (เช่น curl / Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

// --------------------
// Body Parser
// --------------------
app.use(express.json());

// --------------------
// Test Route
// --------------------
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// --------------------
// Connect to MongoDB
// --------------------
connectDB();

// --------------------
// API Routes
// --------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/contract', contractRoutes);
app.use('/api/projects', projectRoutes);

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
