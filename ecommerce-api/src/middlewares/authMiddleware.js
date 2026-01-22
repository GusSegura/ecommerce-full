  import jwt from 'jsonwebtoken';
  const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

  export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token faltante' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token inválido' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: payload.id, 
      id: payload.id,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
  }
