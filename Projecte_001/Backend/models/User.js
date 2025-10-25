const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Información básica
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  
  // IDs de OAuth
  googleId: {
    type: String,
    sparse: true
  },
  githubId: {
    type: String,
    sparse: true
  },
  
  // Información de la cuenta
  provider: {
    type: String,
    enum: ['google', 'github', 'email'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Plan y suscripción
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  subscriptionId: String,
  
  // Estadísticas de uso
  usage: {
    wordsGenerated: {
      type: Number,
      default: 0
    },
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ githubId: 1 });
userSchema.index({ createdAt: 1 });

module.exports = mongoose.model('User', userSchema);