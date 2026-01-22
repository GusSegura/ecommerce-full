import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Product from '../models/product.js';
import { fileURLToPath } from 'url';
import {
  getProducts,
  getProductById,
  getProductByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategoryName
} from '../controllers/productController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';
import validate from '../middlewares/validation.js';
import { query } from 'express-validator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Crear carpeta si no existe
const uploadDir = path.join(__dirname, '../../public/productos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Carpeta productos creada');
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: fileFilter
});

// Middleware de debug
const debugUpload = (req, res, next) => {
  console.log('\n🔵 === PETICIÓN A PRODUCTOS ===');
  console.log('Método:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Content-Type:', req.headers['content-type']);
  next();
};

// RUTAS (sin duplicados)
router.get('/', [
  query('page').optional().isNumeric().withMessage('Page must be a number'),
  query('limit').optional().isNumeric().withMessage('Limit must be a number'),
], validate, getProducts);

router.get('/search', searchProducts);
router.get('/by-category/:name', getProductsByCategoryName);
router.get('/category/:idCategory', getProductByCategory);
router.get('/:id', getProductById);

// Crear producto 
router.post('/', async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      season: req.body.season,
      imagesUrl: req.body.imagesUrl   
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Error creando producto:', err);
    res.status(500).json({ error: 'Error creando producto' });
  }
});


// Actualizar producto con imágenes
router.put('/:id', upload.array('images'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      updateData.imagesUrl = req.files.map(file => `/public/uploads/${file.filename}`);
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Error actualizando producto:', err);
    res.status(500).json({ error: 'Error actualizando producto' });
  }
  });

// Eliminar producto
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

export default router;