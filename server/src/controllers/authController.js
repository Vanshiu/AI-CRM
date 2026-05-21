import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper: Generate JWT token for authorized sessions
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'super_secret_jwt_key_crm_app', 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password).'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 2. Check for existing email registration
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already in use by another account.'
      });
    }

    // 3. Create new user in the database (password hashed pre-save)
    const newUser = await User.create({
      name,
      email,
      password
    });

    // 4. Generate JWT
    const token = generateToken(newUser._id);

    // 5. Send success response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // 2. Find user in the database, explicitly fetching the hashed password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    // 3. Verify standard password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    // 4. Generate JWT
    const token = generateToken(user._id);

    // 5. Return success token response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Retrieve logged-in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user has already been loaded via 'protect' auth middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (err) {
    next(err);
  }
};
