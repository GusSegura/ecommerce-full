import User from '../models/user.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const register = async (req, res) => {
  try {
    const { displayName, email, password, phone, address, city, state, postalCode } = req.body;

    // Validar existencia previa
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email ya registrado' });

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

   const newUser = new User({
      displayName,
      email,
      password: hashedPassword,
      role: 'customer', 
      phone,
      address,
      city,
      state,
      postalCode,
      isActive: true
    });

    await newUser.save();

    // Crear token
    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({ 
      message: 'Usuario creado', 
      token, 
      user: { 
       _id: newUser._id,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        city: newUser.city,
        state: newUser.state,
        postalCode: newUser.postalCode,
        isActive: newUser.isActive
      } 
    });
  } catch (err) {
    console.error('❌ Error registrando usuario:', error);
    return res.status(500).json({  error: 'Error registrando usuario', details: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 ===== INTENTO DE LOGIN =====');
    console.log('📧 Email recibido:', email);
    console.log('🔑 Password recibido:', password ? '***' : 'NO ENVIADO');
    console.log('📦 Body completo:', req.body);

    // Validar que se envíen ambos campos
    if (!email || !password) {
      console.log('❌ Faltan campos requeridos');
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    console.log('👤 Usuario encontrado:', user ? `SÍ (${user.email})` : 'NO');
    
    if (!user) {
      console.log('❌ Usuario no existe en BD');
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    console.log('🔐 Comparando contraseñas...');
    // Comparar contraseña ingresada con la encriptada en BD
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password válido:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    console.log('✅ Login exitoso, generando token...');
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    console.log('✅ Token generado, enviando respuesta');

    // Responder sin exponer la contraseña
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ ===== ERROR EN LOGIN =====');
    console.error('Error completo:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Error en login', details: error.message });
  }
};