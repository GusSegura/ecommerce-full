import express from 'express';
import {
  getOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrder,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

// Crear nueva orden (debe ir ANTES de las rutas con parámetros)
router.post('/', authMiddleware, createOrder);

// Obtener todas las órdenes (admin)
router.get('/', authMiddleware, isAdmin, getOrders);

// Obtener órdenes por usuario
router.get('/user/:userId', authMiddleware, getOrdersByUser);

// Obtener orden por ID
router.get('/:id', authMiddleware, getOrderById);

// Cancelar orden
router.patch('/:id/cancel', authMiddleware, isAdmin, cancelOrder);

// Actualizar estado de la orden
router.patch('/:id/status', authMiddleware, isAdmin, updateOrderStatus);

// Actualizar estado de pago
router.patch('/:id/payment-status', authMiddleware, isAdmin, updatePaymentStatus);

// Actualizar orden completa
router.put('/:id', authMiddleware, isAdmin, updateOrder);

// Eliminar orden
router.delete('/:id', authMiddleware, isAdmin, deleteOrder);

export default router;