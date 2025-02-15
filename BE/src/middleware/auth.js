import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    console.log('Authorization Header:', req.headers.authorization);

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token);
    }

    if (!token) {
      console.log('No token found');
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    console.log('Using JWT_SECRET:', JWT_SECRET ? 'Secret key is set' : 'No secret key found');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);

    req.user = await User.findById(decoded.id).select('-password');
    console.log('User found:', req.user ? {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    } : 'No user');

    if (!req.user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('Authentication successful');
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Checking role authorization:', {
      userRole: req.user.role,
      requiredRoles: roles
    });

    if (!roles.includes(req.user.role)) {
      console.log('Authorization failed: Invalid role');
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    console.log('Authorization successful');
    next();
  };
};
