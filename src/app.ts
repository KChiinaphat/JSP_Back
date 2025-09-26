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

  // Middleware
  app.use(cors({
    origin: ['http://localhost:5173', 'http://192.168.1.228:5173', 'http://JSPMETALWORKS.com'],
    credentials: true,
  }));
  app.use(express.json());

  // Connect to MongoDB
  connectDB();

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use ('/api/contract', contractroutes);
  app.use ('/api/projects', ProjectRoutes);

  export default app; 