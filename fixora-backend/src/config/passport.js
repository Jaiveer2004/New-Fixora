const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const User = require("../models/user.model");

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // FOR DEBUGGING:
        console.log(profile);

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.authProvider = 'google';
          user.googleId = profile.id;
          user.profilePicture = profile.photos[0]?.value || user.profilePicture;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = await User.create({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          authProvider: 'google',
          profilePicture: profile.photos[0]?.value || 'default_profile_picture_url',
          role: 'customer',
        });

        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;