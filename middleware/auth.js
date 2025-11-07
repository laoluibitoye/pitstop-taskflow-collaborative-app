const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
    try {
        let token;
        
        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Check if user is suspended
            if (req.user.isSuspended) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been suspended'
                });
            }
            
            // Check if user is active
            if (!req.user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is not active'
                });
            }
            
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Optional authentication - allows both authenticated and guest users
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');
            } catch (error) {
                // Token invalid, continue as guest
                req.user = null;
            }
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

// Authorize specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        
        next();
    };
};

// Check guest limits
exports.checkGuestLimits = (limitType) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            
            // If not a guest, allow
            if (!req.user.isGuest) {
                return next();
            }
            
            // Check specific limit
            if (limitType === 'task' && !req.user.canCreateTask()) {
                return res.status(403).json({
                    success: false,
                    message: 'Guest users can only create 1 task. Please register to create more tasks.',
                    requiresRegistration: true
                });
            }
            
            if (limitType === 'comment' && !req.user.canPostComment()) {
                return res.status(403).json({
                    success: false,
                    message: 'Guest users can only post 1 comment. Please register to post more comments.',
                    requiresRegistration: true
                });
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Verify resource ownership or admin
exports.verifyOwnershipOrAdmin = (Model, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const resource = await Model.findById(req.params[paramName]);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }
            
            // Check if user is admin or owner
            const isOwner = resource.createdBy?.toString() === req.user._id.toString() ||
                          resource.author?.toString() === req.user._id.toString() ||
                          resource.uploadedBy?.toString() === req.user._id.toString();
            
            const isAdmin = req.user.role === 'admin';
            
            if (!isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to perform this action'
                });
            }
            
            req.resource = resource;
            next();
        } catch (error) {
            next(error);
        }
    };
};