import Client from '../models/client.js';

// Obtener todos los clientes con paginación
async function getClients(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const clients = await Client.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Más recientes primero

    const totalResults = await Client.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);

    res.json({
      clients,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    next(error);
  }
}

// Obtener un cliente por ID
async function getClientById(req, res, next) {
  try {
    const id = req.params.id;
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    next(error);
  }
}

// Crear nuevo cliente
async function createClient(req, res, next) {
  try {
    const { firstName, lastName, email, phone, address, city, state, postalCode, isActive } = req.body;

    // Validaciones
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        error: 'First name, last name, and email are required' 
      });
    }

    // Verificar si el email ya existe
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    const newClient = new Client({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      isActive: isActive !== undefined ? isActive : true
    });

    await newClient.save();
    console.log('✅ Cliente creado:', newClient);

    res.status(201).json(newClient);
  } catch (error) {
    console.error('❌ Error creando cliente:', error);
    next(error);
  }
}

// Actualizar cliente
async function updateClient(req, res, next) {
  try {
    const id = req.params.id;
    const { firstName, lastName, email, phone, address, city, state, postalCode, isActive } = req.body;

    // Si se actualiza el email, verificar que no esté en uso
    if (email) {
      const existingClient = await Client.findOne({ 
        email, 
        _id: { $ne: id } 
      });
      
      if (existingClient) {
        return res.status(400).json({ 
          error: 'Email already in use by another client' 
        });
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone, address, city, state, postalCode, isActive },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    console.log('✅ Cliente actualizado:', updatedClient);
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error('❌ Error actualizando cliente:', error);
    next(error);
  }
}

// Eliminar cliente
async function deleteClient(req, res, next) {
  try {
    const id = req.params.id;
    const deletedClient = await Client.findByIdAndDelete(id);
    
    if (!deletedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    console.log('✅ Cliente eliminado:', deletedClient);
    res.status(204).send();
  } catch (error) {
    console.error('❌ Error eliminando cliente:', error);
    next(error);
  }
}

// Buscar clientes
async function searchClients(req, res, next) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const clients = await Client.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    res.json(clients);
  } catch (error) {
    next(error);
  }
}

// Obtener clientes por estado (activos/inactivos)
async function getClientsByStatus(req, res, next) {
  try {
    const isActive = req.params.status === 'true';
    
    const clients = await Client.find({ isActive })
      .sort({ createdAt: -1 });

    res.json(clients);
  } catch (error) {
    next(error);
  }
}

export {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getClientsByStatus
};