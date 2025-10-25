const express = require('express');
const passport = require('passport');
const router = express.Router();

// Iniciar autenticación con Google
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Callback de Google
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL + '/login?error=auth_failed' 
  }),
  (req, res) => {
    // Redirigir al frontend con token de sesión
    res.redirect(process.env.FRONTEND_URL + '/dashboard?login=success');
  }
);

// Iniciar autenticación con GitHub
router.get('/github',
  passport.authenticate('github', { 
    scope: ['user:email'] 
  })
);

// Callback de GitHub
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: process.env.FRONTEND_URL + '/login?error=auth_failed' 
  }),
  (req, res) => {
    // Redirigir al frontend con token de sesión
    res.redirect(process.env.FRONTEND_URL + '/dashboard?login=success');
  }
);

// Obtener información del usuario actual
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
        plan: req.user.plan,
        provider: req.user.provider
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
  }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error al cerrar sesión' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Sesión cerrada exitosamente' 
    });
  });
});

module.exports = router;