import express from 'express';

import authRoutes from './authRoutes.js';
import cartRoutes from './cartRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import shippingAddressRoutes from './shippingAddressRoutes.js';

const router = express.Router();


router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/shipping-addresses', shippingAddressRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productRoutes);

export default router;