import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getClientsByStatus
} from '../controllers/clientController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación y ser admin
router.use(authMiddleware, isAdmin);

// Rutas de clientes
router.get('/', getClients);                    // GET /api/clients
router.get('/search', searchClients);           // GET /api/clients/search?q=juan
router.get('/status/:status', getClientsByStatus); // GET /api/clients/status/true
router.get('/:id', getClientById);              // GET /api/clients/:id
router.post('/', createClient);                 // POST /api/clients
router.put('/:id', updateClient);               // PUT /api/clients/:id
router.delete('/:id', deleteClient);            // DELETE /api/clients/:id

export default router;