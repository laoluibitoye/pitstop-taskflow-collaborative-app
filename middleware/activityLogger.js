const ActivityLog = require('../models/ActivityLog');

// Log activity
exports.logActivity = async (userId, action, targetType, targetId, details, req) => {
    try {
        await ActivityLog.create({
            user: userId,
            action,
            targetType,
            targetId,
            details,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.headers['user-agent']
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

// Middleware to automatically log activities
exports.autoLog = (action, targetType) => {
    return async (req, res, next) => {
        // Store original json function
        const originalJson = res.json.bind(res);
        
        // Override json function
        res.json = function(data) {
            // Only log if successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const targetId = data?.data?._id || req.params.id || req.params.taskId;
                
                exports.logActivity(
                    req.user?._id,
                    action,
                    targetType,
                    targetId,
                    {
                        method: req.method,
                        path: req.path,
                        body: req.body
                    },
                    req
                ).catch(err => console.error('Activity log error:', err));
            }
            
            // Call original json function
            return originalJson(data);
        };
        
        next();
    };
};