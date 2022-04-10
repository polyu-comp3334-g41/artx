const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');
const UserSession = require('../models/userSession.model');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

const localStrategy = new LocalStrategy({ usernameField: 'addr', passwordField: 'signature' }, function (
  addr,
  signature,
  done
) {
  UserSession.findOne({ addr }, function (err, user) {
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
});

module.exports = {
  jwtStrategy,
  localStrategy,
};
