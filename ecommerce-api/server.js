import express from 'express';
import dotenv from 'dotenv';
import 'dotenv/config';
import cors from 'cors';

import routes from './src/routes/index.js';
import dbConnection from './src/config/database.js';
import logger from './src/middlewares/logger.js';
import setupGlobalErrorHandlers from './src/middlewares/globalErrorHandler.js';
import errorHandler from './src/middlewares/errorHandler.js';

import productsRoutes from "./src/routes/productRoutes.js";
import clientRoutes from './src/routes/clientRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import shippingAddressRoutes from './src/routes/shippingAddressRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
setupGlobalErrorHandlers();

// Para poder usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dbConnection();

// console.log("CORS ORIGIN:", process.env.FRONT_APP_URL);
// app.use(
//   cors({
//     origin: process.env.FRONT_APP_URL,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true,
//     optionsSuccessStatus: 200,
//   })
// );

const allowedOrigins = [
  process.env.FRONT_APP_URL,
  "http://localhost:4200"
];

app.options('*', cors());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);



// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Servir archivos estáticos de la carpeta public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rutas correctas AQUÍ (antes del 404)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api', routes);
app.use('/api/cart', cartRoutes);
app.use('/api/shipping-address', shippingAddressRoutes);
app.use('/api', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.send('WELCOME!');
});

// Middleware 404 (debe ir al final)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
  });
});

// Error Handler AL FINAL DEL TODO
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
