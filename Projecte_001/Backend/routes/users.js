// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Obtener perfil del usuario actual
router.get('/profile', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        provider: user.provider,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        usage: user.usage
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// Actualizar perfil del usuario
router.put('/profile', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// Obtener estadísticas de uso
router.get('/usage', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      usage: user.usage
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// Actualizar plan del usuario
router.put('/plan', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    const { plan } = req.body;
    
    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Plan no válido'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { plan },
      { new: true }
    );

    res.json({
      success: true,
      message: `Plan actualizado a ${plan}`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Error actualizando plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

// Eliminar cuenta de usuario
router.delete('/account', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    await User.findByIdAndDelete(req.user._id);
    
    req.logout((err) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
      }
    });

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
});

module.exports = router;