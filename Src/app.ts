import express from 'express';
import cors from 'cors';
import connectDB from './utils/db';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import eventRoutes from './routes/event.routes';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';

connectDB();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // or '*' for dev
  credentials: true, 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api', authRoutes); 
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);

export default app;
