const passport = require('passport');
const UserSession = require('../models/userSession.model')

passport.use(
  new LocalStrategy(function (addr, signature, done) {
    UserSession.findOne({ addr: addr }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifySignature(signature)) {
        return done(null, false);
      }
      return done(null, user);
    });
  })
);
