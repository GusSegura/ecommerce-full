import express from 'express';
import {
  getCarts,
  getCartById,
  getCartByUser,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,

  // NUEVOS CONTROLADORES
  getMyCart,
  addToMyCart,
  removeFromMyCart,
  clearMyCart,
  updateProductQuantity,
} from '../controllers/cartController.js';

import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

//   RUTAS PARA ADMIN

// Obtener todos los carritos (admin)
router.get('/cart', authMiddleware, isAdmin, getCarts);

// Obtener carrito por ID
router.get('/cart/:id', authMiddleware, isAdmin, getCartById);

// Obtener carrito por usuario (admin)
router.get('/cart/user/:id', authMiddleware, getCartByUser);

// Crear nuevo carrito (admin)
router.post('/cart', authMiddleware, createCart);

// Agregar producto al carrito (admin)
router.post('/cart/add-product', authMiddleware, addProductToCart);

// Actualizar carrito completo
router.put('/cart/:id', authMiddleware, updateCart);

// Eliminar carrito
router.delete('/cart/:id', authMiddleware, deleteCart);




//   RUTAS PARA EL USUARIO LOGUEADO

router.get('/my', authMiddleware, getMyCart);
router.post('/my/add', authMiddleware, addToMyCart);
router.delete('/my/remove/:productId', authMiddleware, removeFromMyCart);
router.delete('/my/clear', authMiddleware, clearMyCart);
router.patch('/my/update/:productId', authMiddleware, updateProductQuantity);

export default router;
