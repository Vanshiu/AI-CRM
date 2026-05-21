import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Retrieve authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. No token provided.'
    });
  }

  try {
    // 3. Verify standard JWT signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_crm_app');

    // 4. Verify that the user still exists in the database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 5. Attach loaded database user to the request object
    req.user = currentUser;
    next();
  } catch (error) {
    console.error(`[Auth Middleware Error] Token verification failed: ${error.message}`);

    // Standard expired token response
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your login session has expired. Please log in again.'
      });
    }

    // Standard malformed or invalid token response
    return res.status(401).json({
      success: false,
      message: 'Authorization denied. Token is invalid or has been tampered with.'
    });
  }
};
