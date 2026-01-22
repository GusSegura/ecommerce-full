import express from 'express';
import { body, param, query } from 'express-validator';
import validate from '../middlewares/validation.js';
import {
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUserProfile,
  changePassword,
  updateUser,
  deactivateUser,
  toggleUserStatus,
  deleteUser,
  createUser,
  login,
  searchUser
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Middleware de autenticación
import isAdmin from '../middlewares/isAdminMiddleware.js'; // Middleware de admin
import User from '../models/User.js';

const router = express.Router();

// Validaciones comunes para actualizar perfil
const profileValidations = [
  body('displayName')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Display name must contain only letters, numbers and spaces')
    .trim(),

  body('email')
    .optional()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isLength({ min: 10, max: 10 }).withMessage('Phone must be exactly 10 digits')
    .isNumeric().withMessage('Phone must contain only numbers'),

  body('avatar')
    .optional()
    .isURL().withMessage('Avatar must be a valid URL')
];

// Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, getUserProfile);

// Obtener todos los usuarios (solo admin)
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('role')
    .optional()
    .isIn(['admin', 'customer', 'guest']).withMessage('Role must be admin, customer, or guest'),

  query('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean value')
], validate, authMiddleware, isAdmin, getAllUsers);

//http://localhost:3000/api/users/search
//http://localhost:3000/api/users/admin (admin es parametro y seach es una ruta)
router.get('/search', searchUser);


// Obtener usuario por ID (solo admin)
router.get('/:userId', [
  param('userId')
    .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, getAllUsers, getUserById);

//propuesto
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-hashPassword');
  res.json({ user });
});

// Actualizar perfil del usuario
router.put('/profile', profileValidations, validate, authMiddleware, updateUserProfile);

// Cambiar contraseña
router.put('/change-password', [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    .matches(/\d/).withMessage('New password must contain at least one number')
    .matches(/[a-zA-Z]/).withMessage('New password must contain at least one letter'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
], validate, authMiddleware, changePassword);

// Actualizar usuario (solo admin)
router.put('/:userId', [
  param('userId')
    .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId'),

  ...profileValidations,

  body('role')
    .optional()
    .isIn(['admin', 'customer', 'guest']).withMessage('Role must be admin, customer, or guest'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean value')
], validate, authMiddleware, isAdmin, updateUser);

// Desactivar cuenta propia
router.patch('/deactivate', authMiddleware, deactivateUser);

// Activar/Desactivar usuario (solo admin)
router.patch('/:userId/toggle-status', [
  param('userId')
    .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, toggleUserStatus);

// Eliminar usuario (solo admin)
router.delete('/:userId', [
  param('userId')
    .isMongoId().withMessage('User ID must be a valid MongoDB ObjectId')
], validate, authMiddleware, isAdmin, deleteUser);

//se creó ruta para alta de usuario con POSTMAN
router.post(  '/',  [
    body('displayName')
      .notEmpty().withMessage('Display name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters'),

    body('email')
      .isEmail().withMessage('Valid email is required'),

    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    body('role')
      .isIn(['admin', 'customer', 'guest']).withMessage('Role must be admin, customer, or guest'),

    body('phone')
      .isLength({ min: 10, max: 10 }).withMessage('Phone must be exactly 10 digits')
      .isNumeric().withMessage('Phone must contain only numbers'),

    body('avatar')
      .optional()
      .isURL().withMessage('Avatar must be a valid URL'),

    body('address').optional().isLength({ max: 255 }),
    body('city').optional().isLength({ max: 100 }),
    body('state').optional().isLength({ max: 100 }),
    body('postalCode').optional().isLength({ min: 5, max: 5 }).isNumeric()
  ],
  validate,
  // authMiddleware, isAdmin, // solo admin pueda crear usuarios
  (req, res) => {
    // llamar a controlador para registrar  
    import('../controllers/userController.js').then(module => {
      module.createUser(req, res);
    });
  }
);

router.post("/login", login);

export default router;