const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser && !existingUser.isGuest) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        
        // Create user
        const user = await User.create({
            name,
            email,
            password
        });
        
        // Log activity
        await logActivity(user._id, 'user_registered', 'User', user._id, { email }, req);
        
        // Generate token
        const token = generateToken(user._id);
        
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isGuest: user.isGuest
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Check if user is suspended
        if (user.isSuspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended'
            });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Log activity
        await logActivity(user._id, 'user_login', 'User', user._id, null, req);
        
        // Generate token
        const token = generateToken(user._id);
        
        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isGuest: user.isGuest
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   POST /api/auth/guest
// @desc    Create guest user
// @access  Public
router.post('/guest', [
    body('name').optional().trim().isLength({ min: 2, max: 50 })
], async (req, res) => {
    try {
        const { name } = req.body;
        
        // Create guest user
        const guest = await User.createGuest(name);
        
        // Log activity
        await logActivity(guest._id, 'guest_joined', 'User', guest._id, { name: guest.name }, req);
        
        // Generate token
        const token = generateToken(guest._id);
        
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: guest._id,
                name: guest.name,
                email: guest.email,
                role: guest.role,
                isGuest: guest.isGuest,
                guestLimits: guest.guestLimits
            }
        });
    } catch (error) {
        console.error('Guest creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating guest user'
        });
    }
});

// @route   POST /api/auth/convert-guest
// @desc    Convert guest to registered user
// @access  Private (Guest)
router.post('/convert-guest', [
    protect,
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase, lowercase, number and special character')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        // Check if user is guest
        if (!req.user.isGuest) {
            return res.status(400).json({
                success: false,
                message: 'Only guest users can be converted'
            });
        }
        
        const { email, password } = req.body;
        
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser && !existingUser.isGuest) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }
        
        // Convert guest to user
        await req.user.convertGuestToUser(email, password);
        
        // Log activity
        await logActivity(req.user._id, 'guest_converted', 'User', req.user._id, { email }, req);
        
        // Generate new token
        const token = generateToken(req.user._id);
        
        res.json({
            success: true,
            token,
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                isGuest: req.user.isGuest
            }
        });
    } catch (error) {
        console.error('Guest conversion error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error converting guest user'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                isGuest: req.user.isGuest,
                guestLimits: req.user.guestLimits
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
    try {
        // Log activity
        await logActivity(req.user._id, 'user_logout', 'User', req.user._id, null, req);
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;