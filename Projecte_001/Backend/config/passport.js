const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Serialización del usuario
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Estrategia de Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Buscar usuario existente
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (user) {
      // Actualizar datos de Google si es necesario
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    // Crear nuevo usuario
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0].value,
      provider: 'google',
      isVerified: true
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Estrategia de GitHub
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback",
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Buscar usuario existente
    let user = await User.findOne({ 
      $or: [
        { githubId: profile.id },
        { email: profile.emails?.[0]?.value }
      ]
    });

    if (user) {
      // Actualizar datos de GitHub si es necesario
      if (!user.githubId) {
        user.githubId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    // Crear nuevo usuario
    user = new User({
      githubId: profile.id,
      email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
      name: profile.displayName || profile.username,
      avatar: profile.photos[0].value,
      provider: 'github',
      isVerified: true
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));