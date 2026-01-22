import bcrypt from "bcrypt";
import User from "../models/User.js";

// Obtener perfil del usuario autenticado
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Asumiendo que tienes middleware de autenticación

    const user = await User.findById(userId).select("-hashPassword");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res, next) => {
   try {
    // parámetros de paginación desde query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // contar total de usuarios
    const totalUsers = await User.countDocuments();

    // calcular total de páginas
    const totalPages = Math.ceil(totalUsers / limit);

    // obtener usuarios de la página actual
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit);

    // construir objeto de paginación con totalResults
    const pagination = {
      totalResults: totalUsers,   // 👈 agregado
      totalPages,
      currentPage: page,
      hasPrev: page > 1,
      hasNext: page < totalPages
    };

    // responder con usuarios + paginación
    res.json({ users, pagination });
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios', details: error.message });
  }
};

// Obtener usuario por ID (solo admin)
const getUserById = async (req, res, next) => {
//   try {
//     const { userId } = req.params;

//     const user = await User.findById(userId).select("-hashPassword");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({
//       message: "User retrieved successfully",
//       user,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role; // ⬅️ Nuevo: filtro opcional

    // Construir filtro
    let filter = {};
    if (role) {
      filter.role = role; // Filtrar por role si se especifica
    }

    const users = await User.find(filter)
      .select('-password') // No incluir password
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalResults = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    res.json({
      users,
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

// Actualizar perfil del usuario
const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { displayName, email, phone, avatar } = req.body;

    // Verificar si el email ya existe (si se está cambiando)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Actualizar campos
    if (displayName) user.displayName = displayName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    // Devolver usuario sin password
    const updatedUser = await User.findById(userId).select("-hashPassword");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.hashPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    user.hashPassword = hashedNewPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar usuario (solo admin)
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      displayName,
      email,
      phone,
      avatar,
      role,
      isActive,
      address,
      city,
      state,
      postalCode,
      password
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verificar si el email ya existe (si se está cambiando)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Actualizar campos
    if (displayName) user.displayName = displayName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (postalCode) user.postalCode = postalCode;

    await user.save();

    // Excluir contraseña en la respuesta
    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    next(error);
  }
};

// Desactivar usuario
const deactivateUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      message: "Account deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Activar/Desactivar usuario (solo admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    const updatedUser = await User.findById(userId).select("-hashPassword");

    res.status(200).json({
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar cuenta (soft delete)
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Soft delete - solo desactivar
    user.isActive = false;
    await user.save();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const searchUser = async (req, res, next) => {
  try {
    const {
      q,
      displayName,
      email,
      phone,
      role,
      isActive,
      sort,
      order,
      page = 1,
      limit = 10,
    } = req.query;
    //http://localhost:3000/api/users/search?q=santiago;
    let filters = {};

    if (displayName) {
      filters.displayName = { $regex: displayName, $options: "i" };
    }
    if (q) {
      filters.$or = [
        { displayName: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    //http://localhost:3000/api/users/search?sort=email;
    if (role) {
      filters.role = role;
    }
    if (isActive === "true") {
      filters.isActive = true;
    } else if (isActive === "false") {
      filters.isActive = false;
    }

    let sortOptions = {};

    if (sort) {
      const sortOrder = order === "desc" ? -1 : 1;
      sortOptions[sort] = sortOrder;
    } else {
      sortOptions.email = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalResul = await User.find(filters);
    const totalPages = Math.ceil(totalResul / parseInt(limit));

    res.status(200).json({
      users,
      Pagination:{
        currentPage: parseInt(page),
        totalPages,
        totalResul,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      filters:{
        searchTearm: q || null,
        role: role || null,
        isActive: isActive === 'true' ? true : false,
        order: order || 'email'
      }
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
};


//función para crear usuario:

const createUser = async (req, res, next) => {
  try {
    const { displayName, email, password, role, phone, address, city, state, postalCode ,avatar, isActive } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const newUser = new User({
      displayName,
      email,
      password: hashedPassword,
      role,        // puede ser admin, customer o guest
      phone,
      address,
      city,
      state,
      postalCode,
      avatar,      // si no se envía, se usa el valor default del modelo
      isActive: isActive !== undefined ? isActive : true
    });

    await newUser.save();

    // Respuesta exitosa (no devolver la contraseña)
    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
        address: newUser.address,
        city: newUser.city,
        state: newUser.state,
        postalCode: newUser.postalCode,
        isActive: newUser.isActive
      },
    });
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    res.status(500).json({ error: 'Error creando usuario', details: error.message });
  }
};

const login = async (req, res) => { 
  const { email, password } = req.body; 
  const user = await User.findOne({ email }); 
  if (!user) { return res.status(400).json({ error: "Usuario no encontrado" }); } 
  if (user.password !== password) { return res.status(400).json({ error: "Contraseña incorrecta" }); } 
  return res.status(200).json({ message: "Login exitoso", user }); };

export {
  getUserProfile,
  getAllUsers,
  getUserById,
  updateUserProfile,
  changePassword,
  updateUser,
  deactivateUser,
  toggleUserStatus,
  deleteUser,
  searchUser,
  createUser,
  login

};