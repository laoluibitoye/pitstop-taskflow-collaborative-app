const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    isGuest: {
        type: Boolean,
        default: false
    },
    guestConvertedAt: {
        type: Date
    },
    guestLimits: {
        tasksCreated: {
            type: Number,
            default: 0
        },
        commentsPosted: {
            type: Number,
            default: 0
        }
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method to check if user can create task (guest limit check)
userSchema.methods.canCreateTask = function() {
    if (!this.isGuest) return true;
    return this.guestLimits.tasksCreated < 1;
};

// Method to check if user can post comment (guest limit check)
userSchema.methods.canPostComment = function() {
    if (!this.isGuest) return true;
    return this.guestLimits.commentsPosted < 1;
};

// Method to convert guest to registered user
userSchema.methods.convertGuestToUser = async function(email, password) {
    this.email = email;
    this.password = password;
    this.isGuest = false;
    this.guestConvertedAt = new Date();
    await this.save();
    return this;
};

// Static method to create guest user
userSchema.statics.createGuest = async function(name) {
    const guestEmail = `guest_${Date.now()}@temporary.com`;
    const guestPassword = Math.random().toString(36).substring(7);
    
    const guest = await this.create({
        name: name || `Guest_${Date.now()}`,
        email: guestEmail,
        password: guestPassword,
        isGuest: true
    });
    
    return guest;
};

module.exports = mongoose.model('User', userSchema);