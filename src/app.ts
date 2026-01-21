import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import authRouter from './routes/authRoutes';
import clientRouter from './routes/clientRoutes';
import productRouter from './routes/productRoutes';
import creditRouter from './routes/creditRoutes';
import dashboardRouter from './routes/dashboardRoutes';
import categoryRouter from './routes/categoryRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/clients', clientRouter);
app.use('/api/products', productRouter);
app.use('/api/credits', creditRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/categories', categoryRouter);

app.get('/', (req, res) => {
    res.send('HK2 Credit System API Running');
});

export default app;
